import React from 'react';

export const LoFiOverlay: React.FC = () => {
  return (
    <section id="screen-lofi" className="screen lofi-shell active">
      <div className="lofi-wrap">
        <div className="lofi-banner">
          Stage 2 — Low-fidelity throwaway prototype. Grayscale wireframe used only to test structure, flow and field grouping before visual design.
        </div>

        <div className="lofi-page">
          <div className="lofi-box lofi-header">MERIDIAN CREDIT — LOGIN</div>
          <div className="lofi-box">[ Username field ]</div>
          <div className="lofi-box">[ Password field ]</div>
          <div className="lofi-box lofi-btn">[ Login button ]</div>
          <div className="lofi-box lofi-btn">[ Register link ]</div>
        </div>

        <div className="lofi-page">
          <div className="lofi-box lofi-header">REGISTRATION — SINGLE LONG FORM (v1, rejected)</div>
          <div className="lofi-box">
{`[ Full name ][ DOB ][ Gender ][ Mobile ][ Email ][ Address ][ City ][ State ][ ZIP ]
[ Username ][ Password ][ Confirm password ]
[ Security Q ][ Security A ][ Captcha ]
[ ] Terms  [ ] Privacy`}
          </div>
          <div className="lofi-box lofi-btn">[ Submit ]</div>
          <div className="lofi-issue">
            Issue found in evaluation: 15 fields on one screen, no grouping, no progress indication, high abandonment risk.
          </div>
        </div>

        <div className="lofi-page">
          <div className="lofi-box lofi-header">CREDIT CARD APPLICATION — v1 (rejected)</div>
          <div className="lofi-box">[ All personal + employment + financial + card + upload fields on one page ]</div>
          <div className="lofi-box lofi-btn">[ Submit application ]</div>
          <div className="lofi-issue">
            Issues found: no step indicator, unclear which fields are mandatory, no way to review before submit, confusing document section mixed with financial fields.
          </div>
        </div>

        <div className="lofi-page">
          <div className="lofi-box lofi-header">DASHBOARD — v1 (rejected)</div>
          <div className="lofi-box">
{`[ Status text only, no visual hierarchy ]
[ Apply link ][ Track link ][ Profile link ]`}
          </div>
          <div className="lofi-issue">
            Issue found: no distinction between primary and secondary actions, no notification surfacing, flat list of links.
          </div>
        </div>

        <div className="lofi-note">
          See "Final (Hi-Fi)" toggle above for the improved prototype that resolved every issue listed here: sectioned registration, six-step application with a persistent stepper, card-based dashboard with status pill and quick actions, and a visual review-and-submit summary.
        </div>
      </div>
    </section>
  );
};
