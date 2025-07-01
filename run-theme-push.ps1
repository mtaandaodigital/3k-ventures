# Shopify store configuration - using environment variables from Git secrets
$env:SHOPIFY_FLAG_STORE = "3k-ventures-store.myshopify.com"
# Password should be set via environment variable or GitHub secrets
$env:SHOPIFY_FLAG_PASSWORD = "" # Do not hardcode passwords here
$env:SHOPIFY_FLAG_THEME_ID = "141264420918"

# Set timeout to help with connection issues
$env:SHOPIFY_CLI_HTTP_TIMEOUT = "60"

Write-Host "Environment variables set. Running shopify theme push..."
Write-Host "Attempting to push theme files to $env:SHOPIFY_FLAG_STORE..."

# Try up to 3 times with increasing delays
$maxRetries = 3
$retryCount = 0
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    try {
        if ($retryCount -gt 0) {
            Write-Host "Retry attempt $retryCount of $maxRetries after waiting $($retryCount * 5) seconds..."
            Start-Sleep -Seconds ($retryCount * 5)
        }
        
        # Run the command with --allow-live flag to bypass the confirmation prompt
        # and capture its output
        $output = shopify theme push --allow-live 2>&1
        
        # Check if the command was successful
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "Theme push completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Theme push failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            Write-Host $output
        }
    } catch {
        Write-Host "Error occurred: $_" -ForegroundColor Red
    }
    
    $retryCount++
}

if (-not $success) {
    Write-Host "Failed to push theme after $maxRetries attempts." -ForegroundColor Red
    Write-Host "Please check your network connection and credentials." -ForegroundColor Yellow
    Write-Host "You can also try running 'shopify logout' and then 'shopify login' to refresh your authentication." -ForegroundColor Yellow
}