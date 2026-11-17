# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["MeridianCredit.API.csproj", "./"]
RUN dotnet restore "MeridianCredit.API.csproj"

# Copy source code and publish
COPY . .
RUN dotnet publish "MeridianCredit.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose port (Render sets PORT env variable dynamically)
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MeridianCredit.API.dll"]
