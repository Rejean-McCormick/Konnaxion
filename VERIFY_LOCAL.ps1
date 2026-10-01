param(
    [string]$ApiOrigin = "http://127.0.0.1:8000"
)

$ErrorActionPreference = "Stop"
$WorldMap = @{
    "unesco" = @("unesco-commons","unesco-culture-heritage","unesco-education","unesco-humanity-society","unesco-information-digital","unesco-ocean","unesco-science-planet")
    "cuba-2026" = @("cuba-koali-offline")
    "kristal-farms" = @("kf-ch-exoscale","kf-ch-infomaniak","kf-de-t-systems","kf-fr-ovhcloud","kf-fr-scaleway","kf-jp-kddi","kf-jp-sakura-internet","kf-kr-naver-cloud","kf-kr-sk-telecom","kf-nl-nebius","kf-uk-nscale")
    "levis" = @("levis-affaires-juridiques-greffe","levis-approvisionnement-immobilier","levis-capital-humain","levis-communications-citoyens","levis-developpement-economique","levis-direction-generale","levis-entretien-infrastructures","levis-environnement","levis-finances","levis-genie","levis-incendie","levis-mobilite","levis-police","levis-securite-civile","levis-ti-transformation","levis-urbanisme","levis-vie-communautaire")
}

$Rows = @()
foreach ($Universe in $WorldMap.Keys) {
    foreach ($World in $WorldMap[$Universe]) {
        $Base = "$ApiOrigin/api/u/$Universe/w/$World"
        try {
            $Runtime = Invoke-RestMethod "$Base/runtime/"
            $Payload = ConvertFrom-Json ((Invoke-WebRequest "$Base/ethikos/topics/").Content)
            if ($Payload -is [System.Array]) { $Items = $Payload }
            elseif ($null -ne $Payload.results) { $Items = $Payload.results }
            else { $Items = @($Payload) }
            $Reading = "n/a"
            if ($Items.Count -gt 0) {
                $TopicId = $Items[0].id
                try {
                    $R = Invoke-RestMethod "$Base/v1/smart-vote/readings/ethikos-topic/$TopicId/"
                    if ($null -ne $R.readings -and $R.readings.Count -gt 0) {
                        $Reading = $R.readings[0].reading_key
                    } else { $Reading = "missing" }
                } catch { $Reading = "ERROR" }
            }
            $Rows += [PSCustomObject]@{
                Universe = $Universe
                World = $World
                Release = $Runtime.release.number
                Topics = $Items.Count
                SmartVote = $Reading
            }
        } catch {
            $Rows += [PSCustomObject]@{ Universe=$Universe; World=$World; Release="ERR"; Topics="ERR"; SmartVote=$_.Exception.Message }
        }
    }
}

$Rows | Sort-Object Universe,World | Format-Table -AutoSize
Write-Host "`nExpected: every World except none should expose topics in this mega update, and the first topic should have ekoh_weighted_v1."
