param(
  [string]$BaseUrl = "https://debt-simplifier.onrender.com"
)

$BaseUrl = $BaseUrl.TrimEnd("/")
$runId = Get-Date -Format "yyyyMMddHHmmss"
$password = "GoaDemo123!"

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [hashtable]$Headers = @{},
    [object]$Body = $null
  )

  $params = @{
    Method = $Method
    Uri = "$BaseUrl$Path"
    Headers = $Headers
    ErrorAction = "Stop"
  }

  if ($null -ne $Body) {
    $params.Body = ($Body | ConvertTo-Json -Compress)
    $params.ContentType = "application/json"
  }

  try {
    return Invoke-RestMethod @params
  } catch {
    $response = $_.Exception.Response
    if ($null -ne $response) {
      $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
      $details = $reader.ReadToEnd()
      throw "API $Method $Path failed ($([int]$response.StatusCode)): $details"
    }
    throw
  }
}

$people = @(
  @{ Key = "alex"; Name = "Alex Morgan"; Email = "alex.goa.$runId@example.com" },
  @{ Key = "maya"; Name = "Maya Patel"; Email = "maya.goa.$runId@example.com" },
  @{ Key = "liam"; Name = "Liam Chen"; Email = "liam.goa.$runId@example.com" },
  @{ Key = "sofia"; Name = "Sofia Garcia"; Email = "sofia.goa.$runId@example.com" },
  @{ Key = "noah"; Name = "Noah Williams"; Email = "noah.goa.$runId@example.com" }
)

$sessions = @{}
foreach ($person in $people) {
  $signup = Invoke-Api -Method "Post" -Path "/auth/signup" -Body @{
    name = $person.Name
    email = $person.Email
    password = $password
  }
  $sessions[$person.Key] = @{
    Token = $signup.token
    User = $signup.user
  }
}

$alexHeaders = @{ Authorization = "Bearer $($sessions.alex.Token)" }
$group = Invoke-Api -Method "Post" -Path "/groups" -Headers $alexHeaders -Body @{
  name = "Goa Trip - October 2026"
}

foreach ($person in $people | Where-Object { $_.Key -ne "alex" }) {
  $headers = @{ Authorization = "Bearer $($sessions[$person.Key].Token)" }
  Invoke-Api -Method "Post" -Path "/groups/$($group.id)/members" -Headers $headers | Out-Null
}

$transactions = @(
  @{ From = "maya"; Amount = 1850; Description = "Villa booking deposit" },
  @{ From = "liam"; Amount = 620; Description = "Airport transfers" },
  @{ From = "sofia"; Amount = 1480; Description = "Beach resort dinner" },
  @{ From = "noah"; Amount = 920; Description = "Scooter rentals" },
  @{ From = "maya"; Amount = 760; Description = "Breakfast supplies" },
  @{ From = "liam"; Amount = 1350; Description = "Water sports" },
  @{ From = "sofia"; Amount = 540; Description = "Beach chairs and umbrellas" },
  @{ From = "noah"; Amount = 880; Description = "North Goa cab fare" },
  @{ From = "maya"; Amount = 430; Description = "Coffee and snacks" },
  @{ From = "liam"; Amount = 2100; Description = "Saturday night dinner" },
  @{ From = "sofia"; Amount = 675; Description = "Sunset cruise tickets" },
  @{ From = "noah"; Amount = 390; Description = "Ice cream and desserts" },
  @{ From = "maya"; Amount = 1120; Description = "Spice market shopping" },
  @{ From = "liam"; Amount = 730; Description = "Fuel for scooters" },
  @{ From = "sofia"; Amount = 980; Description = "Fort Aguada entry and guide" },
  @{ From = "noah"; Amount = 560; Description = "Late night food delivery" },
  @{ From = "maya"; Amount = 1450; Description = "Final brunch" },
  @{ From = "liam"; Amount = 510; Description = "Laundry and essentials" },
  @{ From = "sofia"; Amount = 840; Description = "Photoshoot session" },
  @{ From = "noah"; Amount = 1250; Description = "Return airport cabs" }
)

foreach ($transaction in $transactions) {
  $payer = $sessions[$transaction.From]
  $headers = @{ Authorization = "Bearer $($sessions.alex.Token)" }
  Invoke-Api -Method "Post" -Path "/groups/$($group.id)/pending-transactions" -Headers $headers -Body @{
    amount = $transaction.Amount
    description = $transaction.Description
    fromId = $payer.User.id
  } | Out-Null
}

Write-Host ""
Write-Host "Demo data created successfully." -ForegroundColor Green
Write-Host "Group: $($group.name)"
Write-Host "Group ID: $($group.id)"
Write-Host ""
Write-Host "Sign in to the frontend with:"
Write-Host "Email:    $($people[0].Email)"
Write-Host "Password: $password"
Write-Host ""
Write-Host "Created $($people.Count) users and $($transactions.Count) pending transactions."
