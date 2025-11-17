# Red Mugsy Database Configuration

## Three Separate Databases for Three Forms

### 1. Contact-Us Form Database
```
DATABASE_URL=postgresql://postgres:QZsYUThavYpYpKJuZjijlYWOFOtbyGvS@maglev.proxy.rlwy.net:17550/railway
```
- **API:** contact-api
- **Railway Service:** mugsywebsite-production-b065
- **Host:** maglev.proxy.rlwy.net:17550

### 2. Community Form Database  
```
DATABASE_URL=postgresql://postgres:YMOWCleygGcjDuzqnPMgKZwIjFIxdpmp@switchback.proxy.rlwy.net:12491/railway
```
- **API:** perfect-integrity-api
- **Railway Service:** perfect-integrity-production
- **Host:** switchback.proxy.rlwy.net:12491

### 3. Claims Form Database
```
DATABASE_URL=postgresql://postgres:dyeQtLJpMOoMFoJgUtIjGUPsjGgPOGqF@switchback.proxy.rlwy.net:23515/railway
```
- **API:** (To be configured)
- **Railway Service:** (Claims service)
- **Host:** switchback.proxy.rlwy.net:23515

## Railway Environment Variable Setup

For each Railway service, set the `DATABASE_URL` environment variable to the corresponding database connection string above.

**Important:** These are production database URLs. Keep them secure and never commit them to the repository.
