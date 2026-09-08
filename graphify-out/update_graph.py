import json
import shutil
import sys
from pathlib import Path

from graphify.analyze import god_nodes, suggest_questions, surprising_connections
from graphify.build import build_merge
from graphify.cluster import cluster, score_all
from graphify.detect import detect_incremental, save_manifest
from graphify.export import to_json
from graphify.extract import collect_files, extract
from graphify.report import generate

root = Path('.').resolve()
out_dir = root / 'graphify-out'
out_dir.mkdir(exist_ok=True)

# 1. Save Python path and root
(out_dir / '.graphify_python').write_text(sys.executable, encoding='utf-8')
(out_dir / '.graphify_root').write_text(str(root), encoding='utf-8')

# 2. Detect incremental changes
result = detect_incremental(root)
new_total = result.get('new_total', 0)
deleted = list(result.get('deleted_files', []))

print(f"Incremental detection: {new_total} new/changed files, {len(deleted)} deleted files.")

if new_total == 0 and not deleted:
    print("No changes detected. Graph is up to date.")
    sys.exit(0)

# Save incremental & detect state
(out_dir / '.graphify_incremental.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
detect_data = {
    'files': result.get('new_files', {}),
    'all_files': result.get('files', {}),
    'total_files': result.get('new_total', 0),
    'total_words': result.get('total_words', 0),
    'skipped_sensitive': result.get('skipped_sensitive', []),
    'needs_graph': True,
}
(out_dir / '.graphify_detect.json').write_text(json.dumps(detect_data, ensure_ascii=False), encoding='utf-8')

# 3. Extract AST for code files
new_files = result.get('new_files', {})
code_files = []
for f in new_files.get('code', []):
    p = Path(f)
    if p.exists():
        code_files.extend(collect_files(p) if p.is_dir() else [p])

if code_files:
    ast_res = extract(code_files, cache_root=root)
    print(f"AST extracted: {len(ast_res.get('nodes', []))} nodes, {len(ast_res.get('edges', []))} edges.")
else:
    ast_res = {'nodes': [], 'edges': [], 'input_tokens': 0, 'output_tokens': 0}

# 4. Add semantic entries for docs/images
sem_nodes = [
    {
        'id': 'CLAUDE.md:graphify_rules',
        'label': 'Graphify Integration Rules',
        'node_type': 'CONCEPT',
        'source_file': 'CLAUDE.md',
        'summary': 'Rules for maintaining and querying the graphify knowledge graph in CLAUDE.md'
    },
    {
        'id': 'client/index.html:root',
        'label': 'Client HTML Root',
        'node_type': 'UI_ENTRY',
        'source_file': 'client/index.html',
        'summary': 'HTML entry point mounting main.tsx for SecurePay frontend'
    }
]
sem_edges = [
    {
        'source': 'client/index.html:root',
        'target': 'client/src/main.tsx',
        'relation': 'mounts',
        'provenance': 'EXTRACTED'
    }
]

# Combine AST and semantic
seen = {n['id'] for n in ast_res['nodes']}
merged_nodes = list(ast_res['nodes'])
for n in sem_nodes:
    if n['id'] not in seen:
        merged_nodes.append(n)
        seen.add(n['id'])

merged_edges = ast_res['edges'] + sem_edges

new_extract = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': [],
    'input_tokens': ast_res.get('input_tokens', 0),
    'output_tokens': ast_res.get('output_tokens', 0)
}

(out_dir / '.graphify_extract.json').write_text(json.dumps(new_extract, indent=2, ensure_ascii=False), encoding='utf-8')

# 5. Merge into existing graph.json
if (out_dir / 'graph.json').exists():
    shutil.copy(out_dir / 'graph.json', out_dir / '.graphify_old.json')

prune = list(deleted) or None
G = build_merge(
    [new_extract],
    graph_path=str(out_dir / 'graph.json'),
    prune_sources=prune,
    root=str(root),
    directed=False,
)
print(f"Merged Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges.")

# 6. Cluster & Analyze
communities = cluster(G)
cohesion = score_all(G, communities)
gods = god_nodes(G)
surprises = surprising_connections(G, communities)

labels = {}
for cid, nids in communities.items():
    sample_names = [G.nodes[nid].get('label', nid) for nid in nids[:2] if nid in G.nodes]
    if sample_names:
        labels[cid] = f"C{cid}: " + ", ".join(sample_names)
    else:
        labels[cid] = f"Community {cid}"

questions = suggest_questions(G, communities, labels)

wrote = to_json(G, communities, str(out_dir / 'graph.json'))
tokens = {'input': new_extract.get('input_tokens', 0), 'output': new_extract.get('output_tokens', 0)}
report = generate(G, communities, cohesion, labels, gods, surprises, detect_data, tokens, str(root), suggested_questions=questions)

(out_dir / 'GRAPH_REPORT.md').write_text(report, encoding='utf-8')
(out_dir / '.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding='utf-8')

# 7. Save updated manifest
save_manifest(result['files'], root=str(root))

# Clean up temp files
for tmp_name in ['.graphify_old.json', '.graphify_detect.json', '.graphify_extract.json', '.graphify_incremental.json']:
    p = out_dir / tmp_name
    if p.exists():
        p.unlink()

print("Graph update completed successfully!")
