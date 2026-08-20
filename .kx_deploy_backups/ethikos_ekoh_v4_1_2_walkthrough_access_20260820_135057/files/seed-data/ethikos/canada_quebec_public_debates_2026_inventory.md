# Inventaire — Débats publics Québec–Canada 2026

> Package seed normalisé pour `ethikos-demo-scenario/v3`.
> Le JSON principal est la source de vérité machine. Les lectures Smart Vote restent dérivées; les exclusions/récusations déclarées configurent seulement la lecture consultative et ne retirent aucune stance du baseline.
> Corpus V4 walkthrough: **31 acteurs · 14 débats · 67 positions · 78 arguments · 95 liens argument→source · 31 profils EkoH · 1 récusation consultative déclarée**.
> V4.1: les **31 profils EkoH du scénario sont explicitement `rating_visibility=public`** pour la transparence de la démonstration; cette règle de seed ne remplace pas le nouveau contrôle d’accès EkoH générique (`public | scoped | private`).

## Inventaire éditorial détaillé

# Inventaire Ethikos — débats Québec–Canada 2026

**Instantané : 17 août 2026**  
**Scénario :** `canada_quebec_public_debates_2026`  
**Portée :** 14 débats, 31 acteurs, 78 arguments, 95 liens argument→source.  
**Passe éditoriale :** V4 walkthrough — scénario Canada–États-Unis → infrastructure IA → question Trump → lecture EkoH/Smart Vote avec récusation déclarée.

## Méthode

- Les cinq profils ajoutés pour le walkthrough Trump sont **explicitement DEMO** et ne représentent aucune personne réelle.
- Le rapport de contexte King Klown/Trump et les événements associés sont **fictionnels dans le scénario de démonstration**; ils ne doivent pas être interprétés comme des événements réels.
- Une récusation déclarée retire uniquement King Klown de la lecture consultative EkoH/Smart Vote; sa stance source reste visible dans le baseline.
- Les positions et arguments sont des **paraphrases synthétiques**, pas des citations.
- Les sources primaires des gouvernements, partis, organisations professionnelles, syndicats, associations patronales, Premières Nations et organismes concernés sont privilégiées pour attribuer une position.
- Les données de Statistique Canada et du Directeur parlementaire du budget servent surtout de contexte factuel.
- La valeur Ethikos `-3…+3` situe un acteur sur **l’axe propre à chaque débat**; elle ne mesure ni vérité, ni qualité, ni popularité.
- Les nouveaux nœuds utilisent `parent` lorsque le lien de soutien, opposition ou nuance est assez clair pour former un graphe argumentatif.
- Certains débats ont un consensus relatif parmi les principaux acteurs recensés; aucun camp artificiel n’est créé.
- Le fichier `*_sources.json` demeure un sidecar en attendant que le modèle proposé `ArgumentSource` soit importable nativement.

## Répartition des sources

- `official_government` : 37
- `political_party` : 27
- `civil_society` : 4
- `industry_advocacy` : 4
- `official_statistics` : 4
- `independent_officer` : 2
- `professional_order` : 2
- `expert_advisory` : 1
- `first_nations_primary` : 1
- `higher_education_stakeholder` : 1
- `international_standard` : 1
- `labour_union` : 1
- `official_research` : 1

## Débats, acteurs et arguments

### 1. Le Canada devrait-il réduire rapidement le déficit fédéral, même si cela limite certains investissements publics?

Débat sur la vitesse du retour vers l'équilibre budgétaire, la distinction entre dépenses courantes et investissements, le coût du service de la dette et la capacité de financer les priorités futures.

**Pôle + :** Réduction rapide du déficit et discipline budgétaire  
**Pôle − :** Déficits tolérés pour financer des investissements prioritaires

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `-1`, côté `con` : Le gouvernement soutient qu'il faut distinguer les dépenses courantes des investissements de long terme et qu'un retour graduel vers l'équilibre des opérations peut coexister avec des investissements en logement, infrastructures, défense et capacité économique.
  Sources : `finance_spring_update_2026`
- **Parti conservateur du Canada** — stance `+3`, côté `pro` : Les conservateurs soutiennent que des déficits élevés et persistants augmentent la dette, les frais d'intérêt et les pressions fiscales futures; ils privilégient une réduction plus rapide des dépenses et du déficit.
  Sources : `cpc_fiscal_spending`, `cpc_affordable_budget`
- **Directeur parlementaire du budget** — stance `+0`, côté `neutral` : Le Directeur parlementaire du budget conclut que les cibles fiscales annoncées sont atteignables selon les projections de 2026, tout en signalant un manque de précision dans la définition de certaines dépenses classées comme capital, ce qui limite l'évaluation indépendante.
  Sources : `pbo_spring_fiscal_anchors_2026`, `pbo_budget_2025_issues`

**Inventaire des sources du débat**

- `finance_spring_update_2026` — **Department of Finance Canada**, *Spring Economic Update 2026* (2026-04-28) — https://budget.canada.ca/update-miseajour/2026/report-rapport/intro-en.html
- `pbo_spring_fiscal_anchors_2026` — **Parliamentary Budget Officer**, *PBO assessment of the Spring Economic Update fiscal anchors and fiscal sustainability* (2026-05-04) — https://www.pbo-dpb.ca/en/publications/NT-2627-002-S--pbo-assessment-spring-economic-update-fiscal-anchors-fiscal-sustainability--evaluation-dpb-mise-jour-economique-printemps-cibles-budgetaires-viabilite-financiere
- `pbo_budget_2025_issues` — **Parliamentary Budget Officer**, *Budget 2025: Issues for Parliamentarians* (date non fixée dans le sidecar) — https://www.pbo-dpb.ca/en/publications/RP-2526-017-S--budget-2025-issues-parliamentarians--budget-2025-enjeux-parlementaires
- `cpc_fiscal_spending` — **Conservative Party of Canada**, *Liberal Inflationary Spending by the Numbers* (date non fixée dans le sidecar) — https://www.conservative.ca/liberal-inflationary-spending-by-the-numbers/
- `cpc_affordable_budget` — **Conservative Party of Canada**, *An Affordable Budget for Affordable Lives* (date non fixée dans le sidecar) — https://www.conservative.ca/an-affordable-budget-for-affordable-lives/

### 2. Le Canada devrait-il réduire fortement sa dépendance envers les États-Unis, même au prix de coûts à court terme?

Débat sur la diversification commerciale, l'intégration nord-américaine, les tarifs, les chaînes d'approvisionnement, la défense et l'autonomie stratégique du Canada.

**Pôle + :** Diversification et autonomie stratégique plus fortes  
**Pôle − :** Priorité à la restauration de l'intégration et du libre-échange nord-américain

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `+2`, côté `pro` : Le gouvernement fédéral cherche à préserver l'accès au marché américain tout en diversifiant les exportations, les chaînes d'approvisionnement et les partenariats afin de réduire la vulnérabilité du Canada aux mesures commerciales américaines.
  Sources : `gac_canada_us_engagement`, `gac_canada_us_aug_2026`, `gac_state_trade_2026`
- **Parti conservateur du Canada** — stance `-1`, côté `con` : Les conservateurs reconnaissent l'intérêt de diversifier les marchés, mais insistent surtout sur la nécessité de réparer la relation avec Washington et de retrouver un commerce nord-américain largement exempt de tarifs.
  Sources : `cpc_good_deal_us_2026`, `cpc_fighting_for_canada_us`
- **Nouveau Parti démocratique** — stance `+3`, côté `pro` : Le NPD plaide pour une économie canadienne moins vulnérable aux décisions américaines, avec davantage de résilience domestique, de diversification et de protection des travailleurs face aux chocs commerciaux.
  Sources : `ndp_campaign_commitments`
- **Bloc Québécois** — stance `+2`, côté `pro`, parent `us_gov_diversify` : Le Bloc soutient qu'une dépendance aussi forte envers le marché américain rend le Québec vulnérable aux décisions de Washington; il réclame une voix québécoise directe dans les négociations, des contre-mesures ciblées et des mécanismes d'adaptation pour protéger les secteurs exposés.
  Sources : `bq_quebec_voice_us_2025`, `bq_tariffs_pme_2026`

**Inventaire des sources du débat**

- `gac_canada_us_engagement` — **Global Affairs Canada**, *Canada–United States engagement* (2026-07-02) — https://international.canada.ca/en/global-affairs/campaigns/canada-us-engagement
- `gac_canada_us_aug_2026` — **Global Affairs Canada**, *Minister LeBlanc and Chief Trade Negotiator update provincial and territorial trade ministers and advisory committee on Canada-U.S. economic relation* (2026-08-14) — https://www.canada.ca/en/global-affairs/news/2026/08/minister-leblanc-and-chief-trade-negotiator-update-provincial-and-territorial-trade-ministers-and-advisory-committee-on-canada-us-economic-relation.html
- `gac_state_trade_2026` — **Global Affairs Canada**, *State of Trade 2026* (2026) — https://international.canada.ca/en/global-affairs/corporate/reports/chief-economist/state-trade/2026
- `cpc_good_deal_us_2026` — **Conservative Party of Canada**, *Canadians Need a Good Deal* (2026-08-13) — https://www.conservative.ca/canadians-need-a-good-deal/
- `cpc_fighting_for_canada_us` — **Conservative Party of Canada**, *Fighting for Canada* (2026-03-19) — https://www.conservative.ca/fighting-for-canada/
- `ndp_campaign_commitments` — **New Democratic Party of Canada**, *Campaign commitments* (date non fixée dans le sidecar) — https://www.ndp.ca/campaign-commitments
- `bq_quebec_voice_us_2025` — **Bloc Québécois**, *Négociations avec Donald Trump : Le Québec doit parler de sa propre voix* (2025-04-03) — https://www.blocquebecois.org/negociations-avec-donald-trump-le-quebec-doit-parler-de-sa-propre-voix/
- `bq_tariffs_pme_2026` — **Bloc Québécois**, *Journée de l’opposition du Bloc Québécois : Un cri d’alarme pour soutenir nos PME face aux tarifs américains* (2026-05-01) — https://www.blocquebecois.org/journee-de-lopposition-du-bloc-quebecois-un-cri-dalarme-pour-soutenir-nos-pme-face-aux-tarifs-americains/

### 3. Le Canada devrait-il maintenir ou augmenter son soutien militaire, financier et diplomatique à l'Ukraine?

Débat sur l'ampleur et la durée de l'aide canadienne à l'Ukraine, les sanctions, l'assistance militaire, l'aide financière et la recherche d'une paix durable.

**Pôle + :** Maintenir ou accroître le soutien à l'Ukraine  
**Pôle − :** Réduire ou conditionner fortement le soutien

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `+3`, côté `pro` : Le gouvernement du Canada présente le soutien militaire, financier, humanitaire et diplomatique à l'Ukraine comme un engagement durable envers sa souveraineté et sa capacité de résister à l'agression russe.
  Sources : `gac_ukraine_support`, `gac_ukraine_relations`
- **Parti conservateur du Canada** — stance `+3`, côté `pro` : Les conservateurs appuient l'Ukraine, les sanctions contre la Russie et l'utilisation d'actifs russes saisis ou gelés au bénéfice de l'Ukraine, tout en mettant l'accent sur la fermeté envers le Kremlin.
  Sources : `cpc_ukraine_assets`
- **Nouveau Parti démocratique** — stance `+2`, côté `pro` : Le NPD soutient l'Ukraine et demande notamment une meilleure application des sanctions et des mesures de responsabilité internationale; son accent porte davantage sur les institutions, les droits et la diplomatie multilatérale.
  Sources : `ndp_foreign_affairs_ukraine`
- **Bloc Québécois** — stance `+3`, côté `pro`, parent `ukraine_gov_support` : Le Bloc réaffirme un appui ferme à l'indépendance, à la liberté et à la sécurité de l'Ukraine, et considère que le Canada doit demeurer engagé plutôt que devenir un acteur passif face à l'agression russe.
  Sources : `bq_ukraine_2025`

**Inventaire des sources du débat**

- `gac_ukraine_support` — **Global Affairs Canada**, *Canada's response to the Russian invasion of Ukraine* (2026-05-08) — https://www.international.gc.ca/world-monde/issues_development-enjeux_developpement/response_conflict-reponse_conflits/crisis-crises/ukraine-dev.aspx?lang=eng
- `gac_ukraine_relations` — **Global Affairs Canada**, *Canada-Ukraine relations* (2026-05-10) — https://www.international.gc.ca/country-pays/ukraine/relations.aspx?lang=eng
- `cpc_ukraine_assets` — **Conservative Party of Canada**, *Conservatives Will Provide Seized Russian Assets to Ukraine* (date non fixée dans le sidecar) — https://www.conservative.ca/conservatives-will-provide-seized-russian-assets-to-ukraine/
- `ndp_foreign_affairs_ukraine` — **New Democratic Party of Canada**, *Heather McPherson MP: Canada-U.S. relationship and the NDP's vision for foreign affairs in a time of crisis* (2025-01-28) — https://heathermcpherson.ndp.ca/news/heather-mcpherson-mp-canada-us-relationship-and-ndps-vision-foreign-affairs-time-crisis
- `bq_ukraine_2025` — **Bloc Québécois**, *Trois ans d’invasion russe en Ukraine : le Bloc Québécois réaffirme son appui total à l’indépendance ukrainienne* (2025-02-24) — https://www.blocquebecois.org/trois-ans-dinvasion-russe-en-ukraine-le-bloc-quebecois-reaffirme-son-appui-total-a-lindependance-ukrainienne/

### 4. Le Canada devrait-il adopter au Moyen-Orient une ligne plus indépendante des États-Unis et davantage centrée sur le droit international?

Débat couvrant Israël–Palestine et l'Iran : sécurité d'Israël, protection des civils, droit international, solution à deux États, sanctions, programme nucléaire iranien, diplomatie et risque d'escalade régionale.

**Pôle + :** Diplomatie, droit international et autonomie accrue par rapport aux États-Unis  
**Pôle − :** Alignement sécuritaire plus étroit avec les États-Unis et Israël face à l'Iran

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `+1`, côté `pro` : Le gouvernement fédéral défend l'aide humanitaire, la protection des civils, une solution à deux États et une approche diplomatique du dossier nucléaire iranien, tout en condamnant les menaces à la sécurité régionale.
  Sources : `gac_israel_palestine_response`, `gac_israel_palestine_policy`, `gac_iran_diplomacy_2026`
- **Parti conservateur du Canada** — stance `-3`, côté `con` : Les conservateurs adoptent une ligne nettement plus favorable à Israël et à une coopération étroite avec les États-Unis et leurs alliés face au régime iranien, en privilégiant la sécurité et la pression sur Téhéran.
  Sources : `cpc_iran_2026`, `cpc_israel_oct7`
- **Nouveau Parti démocratique** — stance `+3`, côté `pro` : Le NPD met davantage l'accent sur le droit international, la reddition de comptes, la protection des civils et la désescalade, y compris lorsqu'il critique des actions militaires d'Israël ou de l'Iran.
  Sources : `ndp_israel_iran_attacks`, `ndp_war_crimes_accountability`

**Inventaire des sources du débat**

- `gac_israel_palestine_response` — **Global Affairs Canada**, *Canada's response to the crisis in Israel, the West Bank and the Gaza Strip* (2026-03-03) — https://www.international.gc.ca/world-monde/issues_development-enjeux_developpement/response_conflict-reponse_conflits/crisis-crises/israel.aspx?lang=eng
- `gac_israel_palestine_policy` — **Global Affairs Canada**, *Canadian policy on key issues in the Israeli-Palestinian conflict* (date non fixée dans le sidecar) — https://www.international.gc.ca/world-monde/international_relations-relations_internationales/mena-moan/israeli-palestinian_policy-politique_israelo-palestinien.aspx?lang=eng
- `gac_iran_diplomacy_2026` — **Global Affairs Canada**, *Statement at the UN Security Council on the Middle East* (2026-04-28) — https://www.international.gc.ca/world-monde/international_relations-relations_internationales/un-onu/statements-declarations/2026-04-28-middle-east-palestinienne.aspx?lang=eng
- `cpc_iran_2026` — **Conservative Party of Canada**, *Conservative Statement on Military Action Against Iran* (2026) — https://www.conservative.ca/conservative-statement-on-military-action-against-iran/
- `cpc_israel_oct7` — **Conservative Party of Canada**, *Statement from Conservative Leader Pierre Poilievre on the Second Anniversary of the October 7th Attacks* (2025-10-07) — https://www.conservative.ca/statement-from-conservative-leader-pierre-poilievre-on-the-second-anniversary-of-the-october-7th-attacks/
- `ndp_israel_iran_attacks` — **New Democratic Party of Canada**, *NDP statement on Israel's recent attacks* (2025-06-13) — https://www.ndp.ca/news/ndp-statement-israels-recent-attacks
- `ndp_war_crimes_accountability` — **New Democratic Party of Canada**, *NDP letter to ministers re: prosecution of crimes by Canadians in Israel and Palestine* (date non fixée dans le sidecar) — https://heathermcpherson.ndp.ca/news/ndp-letter-ministers-re-prosecution-crimes-canadians-israel-and-palestine

### 5. Le Canada devrait-il taxer davantage les grandes fortunes et profits pour réduire les inégalités et le coût de la vie?

Débat sur la concentration de la richesse, le pouvoir d'achat, la fiscalité des ménages les plus riches, l'investissement privé et les politiques de redistribution.

**Pôle + :** Fiscalité plus redistributive sur grandes fortunes et profits  
**Pôle − :** Priorité à la croissance et aux baisses d'impôts plutôt qu'à de nouvelles taxes sur la richesse

**Acteurs / arguments**

- **Nouveau Parti démocratique** — stance `+3`, côté `pro` : Le NPD propose une fiscalité accrue sur les très grandes fortunes afin de financer les services publics et de réduire la concentration de la richesse et la pression du coût de la vie sur les ménages ordinaires.
  Sources : `ndp_campaign_commitments`
- **Parti conservateur du Canada** — stance `-3`, côté `con` : Les conservateurs privilégient des baisses d'impôts, une réduction des coûts gouvernementaux et une stratégie de croissance plutôt que de nouvelles taxes sur le capital ou la richesse, qu'ils jugent susceptibles de décourager l'investissement.
  Sources : `cpc_affordability_home`, `cpc_affordable_budget`
- **Statistique Canada** — stance `+0`, côté `neutral` : Les données de Statistique Canada montrent une forte concentration de la valeur nette chez les ménages les plus riches et un écart de richesse important entre le haut et le bas de la distribution.
  Sources : `statcan_wealth_q4_2025`, `statcan_weekly_wealth_apr_2026`
- **Québec solidaire** — stance `+3`, côté `pro`, parent `wealth_ndp_tax` : Québec solidaire soutient que le coût de la vie et l'érosion du pouvoir d'achat reflètent aussi une répartition trop inégale des gains économiques; il privilégie une fiscalité plus redistributive, un rôle accru de l'État, des services publics renforcés et des protections salariales.
  Sources : `qs_workers_manifest`
- **Fédération des travailleurs et travailleuses du Québec (FTQ)** — stance `+2`, côté `pro`, parent `wealth_ndp_tax` : La FTQ critique les politiques d'austérité et les baisses d'impôt qui réduisent la capacité de financer les services publics, et soutient qu'une réponse au coût de la vie doit protéger davantage les travailleuses, travailleurs et ménages moins favorisés.
  Sources : `ftq_may_day_2025`

**Inventaire des sources du débat**

- `statcan_wealth_q4_2025` — **Statistics Canada**, *Distributions of household economic accounts for income, consumption, saving and wealth of Canadian households, fourth quarter 2025* (2026-04-13) — https://www150.statcan.gc.ca/n1/daily-quotidien/260413/dq260413a-eng.htm
- `statcan_weekly_wealth_apr_2026` — **Statistics Canada**, *The Weekly Review, April 13 to 17, 2026* (2026-04-17) — https://www.statcan.gc.ca/o1/en/plus/9136-weekly-review-april-13-17-2026
- `ndp_campaign_commitments` — **New Democratic Party of Canada**, *Campaign commitments* (date non fixée dans le sidecar) — https://www.ndp.ca/campaign-commitments
- `cpc_affordability_home` — **Conservative Party of Canada**, *Poilievre Lays Out Plan to Make Canada Affordable at Home* (2026) — https://www.conservative.ca/poilievre-lays-out-plan-to-make-canada-affordable-at-home/
- `cpc_affordable_budget` — **Conservative Party of Canada**, *An Affordable Budget for Affordable Lives* (date non fixée dans le sidecar) — https://www.conservative.ca/an-affordable-budget-for-affordable-lives/
- `qs_workers_manifest` — **Québec solidaire**, *Manifeste pour un Québec solidaire de ses travailleuses et travailleurs* (date non fixée dans le sidecar) — https://appuyez.quebecsolidaire.net/manifeste
- `ftq_may_day_2025` — **FTQ**, *1er mai 2025 — Journée internationale des travailleuses et travailleurs* (2025-05-01) — https://ftq.qc.ca/1er-mai-2025/

### 6. Faut-il accélérer fortement les approbations de projets en réduisant les chevauchements réglementaires et les délais de décision?

Débat sur le coût économique des délais, la coordination fédérale-provinciale, la prévisibilité des autorisations, les consultations et les garanties environnementales et sociales.

**Pôle + :** Accélérer fortement les autorisations et réduire les chevauchements  
**Pôle − :** Maintenir des processus plus longs pour maximiser les garanties et consultations

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `+2`, côté `pro` : Le gouvernement fédéral veut simplifier et accélérer les grands projets par une meilleure coordination, le principe d'un projet–un examen et des échéanciers plus prévisibles, tout en affirmant maintenir les obligations environnementales et de consultation.
  Sources : `canada_regulatory_acceleration_2026`, `canada_major_projects_discussion_2026`
- **Parti conservateur du Canada** — stance `+3`, côté `pro` : Les conservateurs soutiennent que la réglementation et les délais d'autorisation ont rendu le Canada trop lent à construire des infrastructures, des projets énergétiques et des logements; ils proposent d'abroger ou simplifier plusieurs règles jugées bloquantes.
  Sources : `cpc_red_tape_projects`, `cpc_sovereignty_act`
- **Parti libéral du Québec** — stance `+3`, côté `pro`, parent `reg_gov_one_review` : Le PLQ veut réduire rapidement le fardeau administratif des entreprises, notamment par un moratoire sur de nouvelles règles alourdissant les PME et une règle de type « deux pour un » pour les formalités réglementaires.
  Sources : `plq_general_council_2026`
- **Conseil du patronat du Québec** — stance `+3`, côté `pro`, parent `reg_gov_one_review` : Le CPQ considère l'allègement réglementaire et la réduction des délais de permis comme des leviers de compétitivité; il demande que ces objectifs deviennent des pratiques durables et prévisibles de l'administration québécoise.
  Sources : `cpq_bill11_2026`
- **Équiterre** — stance `-2`, côté `con`, parent `reg_gov_one_review` : Équiterre avertit qu'accélérer les grands projets en affaiblissant les protections environnementales peut produire de mauvaises décisions et transférer les coûts écologiques au public; l'accélération devrait plutôt améliorer la planification sans diminuer les exigences de fond.
  Sources : `equiterre_major_projects_2026`
- **Assemblée des Premières Nations Québec-Labrador (APNQL)** — stance `-3`, côté `con`, parent `reg_gov_one_review` : L'APNQL soutient que l'allègement administratif ne doit pas supprimer les mécanismes de suivi, de reddition de comptes ou de consultation, particulièrement lorsque des projets affectent les droits et territoires des Premières Nations.
  Sources : `apnql_bill11_2026`

**Inventaire des sources du débat**

- `canada_regulatory_acceleration_2026` — **Government of Canada**, *Canada's new government to simplify and accelerate Canada's regulatory process* (2026-05-08) — https://www.canada.ca/en/one-canadian-economy/news/2026/05/canadas-new-government-to-simplify-and-accelerate-canadas-regulatory-process.html
- `canada_major_projects_discussion_2026` — **Government of Canada**, *Getting major projects built in Canada: Discussion paper on proposed legislative, regulatory and policy reforms* (2026-07-23) — https://www.canada.ca/en/one-canadian-economy/services/simplifying-canada-process/engagement-supporting-timely-decision-making/getting-major-projects-built-canada-discussion-paper-proposed-legislative-regulatory-policy-reforms.html
- `cpc_red_tape_projects` — **Conservative Party of Canada**, *A New Chapter in an Old Friendship* (2026-03-04) — https://www.conservative.ca/a-new-chapter-in-an-old-friendship/
- `cpc_sovereignty_act` — **Conservative Party of Canada**, *Canadian Sovereignty Act* (date non fixée dans le sidecar) — https://www.conservative.ca/canadian-sovereignty-act/
- `plq_general_council_2026` — **Parti libéral du Québec**, *Conseil général du Parti libéral du Québec à Sherbrooke : Charles Milliard veut réparer le Québec* (2026-06-09) — https://plq.org/conseil-general-du-parti-liberal-du-quebec-a-sherbrooke-charles-milliard-veut-reparer-le-quebec/
- `cpq_bill11_2026` — **Conseil du patronat du Québec**, *Projet de loi 11 : le CPQ salue plusieurs avancées et appelle à ancrer durablement l’allègement réglementaire* (2026-02-04) — https://www.cpq.qc.ca/publications/projet-de-loi-11-le-cpq-salue-plusieurs-avancees-et-appel-a-ancrer-durablement-lallegement-reglementaire-dans-les-facons-de-faire-du-gouvernement/
- `equiterre_major_projects_2026` — **Équiterre**, *Comment bâtir un Canada fort en freinant la transition?* (2026-06-15) — https://www.equiterre.org/fr/ressources/comment-b%C3%A2tir-un-canada-fort-en-freinant-la-transition
- `apnql_bill11_2026` — **Assemblée des Premières Nations Québec-Labrador / Assemblée nationale du Québec**, *Avis de l’APNQL sur le projet de loi 11 — allègement du fardeau réglementaire et administratif* (date non fixée dans le sidecar) — https://www.assnat.qc.ca/Media/Process.aspx?MediaId=ANQ.Vigie.Bll.DocumentGenerique_217945&process=Default&token=ZyMoxNwUn8ikQ+TRKYwPCjWrKwg+vIv9rjij7p3xLGTZDmLVSmJLoqe%2FvG7%2FYWzz

### 7. Le système de justice devrait-il prioriser davantage la rapidité et la sécurité publique, même si cela réduit certaines marges procédurales?

Débat sur les délais judiciaires, l'accès à la justice, l'aide juridique, les règles de mise en liberté, les garanties constitutionnelles et la confiance du public.

**Pôle + :** Priorité accrue à la rapidité, à l'exécution et à la sécurité publique  
**Pôle − :** Priorité accrue à l'accès, aux garanties procédurales et à l'aide juridique

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `+1`, côté `pro` : Le gouvernement cherche à réduire les conséquences des délais judiciaires et à renforcer la sécurité publique, notamment en proposant des outils autres que l'arrêt pur et simple des procédures lorsque les délais deviennent déraisonnables.
  Sources : `justice_c16_delays`, `justice_department_plan_2026`
- **Justice Canada — accès à la justice** — stance `+0`, côté `neutral` : Les travaux fédéraux sur l'accès à la justice soulignent que les réformes doivent rester centrées sur les personnes, préserver l'aide juridique et éviter que l'efficacité procédurale n'accroisse les inégalités pour les groupes déjà marginalisés.
  Sources : `justice_access_overview`, `justice_legal_aid_marginalized`
- **Parti conservateur du Canada** — stance `+3`, côté `pro` : Les conservateurs veulent durcir les règles de mise en liberté pour les récidivistes violents et placent la sécurité du public et l'exécution rapide des décisions au-dessus d'une approche qu'ils jugent trop permissive.
  Sources : `cpc_restore_safe_streets`
- **Gouvernement du Québec** — stance `+0`, côté `neutral` : Le gouvernement du Québec cherche à améliorer simultanément l'accès et l'efficacité par le financement d'initiatives d'accès à la justice et par la transformation numérique des services judiciaires, qui vise notamment à simplifier les démarches et réduire certains délais de traitement.
  Sources : `quebec_justice_digital_2025_2026`, `quebec_fonds_acces_justice`
- **Barreau du Québec** — stance `-1`, côté `con`, parent `justice_gov_delay_remedies` : Le Barreau reconnaît la nécessité de réduire les délais, mais insiste sur une justice accessible et de qualité; ses initiatives privilégient aussi l'information juridique, les cliniques gratuites et des solutions procédurales qui ne sacrifient pas les droits des justiciables.
  Sources : `barreau_clinic_2026`, `barreau_delay_actions_2024`

**Inventaire des sources du débat**

- `justice_department_plan_2026` — **Department of Justice Canada**, *Departmental Plan 2026–27* (2026-03-13) — https://www.justice.gc.ca/eng/rp-pr/cp-pm/rpp/2026_2027/rep-rap/index.html
- `justice_access_overview` — **Department of Justice Canada**, *Access to Justice* (date non fixée dans le sidecar) — https://www.justice.gc.ca/eng/csj-sjc/access-acces/index.html
- `justice_c16_delays` — **Department of Justice Canada**, *Bill C-16: Strengthening the criminal justice system and addressing court delays* (2026) — https://www.justice.gc.ca/eng/csj-sjc/pl/c16/index.html
- `justice_legal_aid_marginalized` — **Department of Justice Canada**, *Legal aid and marginalized populations* (2024) — https://www.justice.gc.ca/eng/rp-pr/jr/aid-aide/2024/p11.html
- `cpc_restore_safe_streets` — **Conservative Party of Canada**, *Restore Safe Streets* (date non fixée dans le sidecar) — https://www.conservative.ca/restore-safe-streets/
- `quebec_justice_digital_2025_2026` — **Gouvernement du Québec**, *Portefeuille des projets prioritaires gouvernemental en transformation numérique 2025-2026* (2025-09-12) — https://www.quebec.ca/gouvernement/ministeres-organismes/cybersecurite-numerique/publications/portefeuille-projets-prioritaires-gouvernemental-transformation-numerique-2025-2026
- `quebec_fonds_acces_justice` — **Ministère de la Justice du Québec**, *Fonds Accès Justice* (2025-11-11) — https://www.quebec.ca/gouvernement/ministeres-organismes/justice/mission-services/faj
- `barreau_clinic_2026` — **Barreau du Québec**, *Clinique juridique du Barreau : un levier concret d’accès à la justice et de formation* (2026-06-05) — https://www.barreau.qc.ca/fr/nouvelle/communiques/clinique-juridique-ecole-barreau-levier-concret-acces-justice-formation/
- `barreau_delay_actions_2024` — **Barreau du Québec**, *Le Barreau du Québec propose plusieurs pistes d’action concrètes pour réduire les délais en matière criminelle et pénale* (2024-02-12) — https://www.barreau.qc.ca/fr/nouvelle/avis-aux-membres/reduction-delais-criminelle-penale-barreau-propose-plusieurs-pistes-action-concretes/

### 8. L'école et l'enseignement supérieur devraient-ils intégrer largement l'IA générative dans l'apprentissage et l'évaluation, sous un cadre éthique?

Débat sur la littératie en IA, les usages pédagogiques, l'intégrité des évaluations, la protection des données, l'équité d'accès et la formation du personnel enseignant.

**Pôle + :** Intégration large et encadrée de l'IA dans l'éducation  
**Pôle − :** Usage fortement restreint ou retardé de l'IA dans l'éducation

**Acteurs / arguments**

- **Gouvernement du Québec — Éducation** — stance `+2`, côté `pro` : Le Québec développe des ressources, un centre d'expertise et un cadre de compétence numérique qui intègrent l'IA; l'orientation est d'encadrer son usage de façon responsable plutôt que de tenter de l'exclure du réseau scolaire.
  Sources : `quebec_ai_education`, `quebec_ai_tools`, `quebec_digital_competency`
- **Conseil consultatif du Canada sur l'intelligence artificielle** — stance `+2`, côté `pro` : Le Conseil consultatif fédéral sur l'IA recommande une littératie en IA accessible dès l'école et tout au long de la vie, avec une attention aux biais, à la sécurité, à la responsabilité et à l'inclusion.
  Sources : `ised_ai_strategy_inputs`, `ai_advisory_learning_responsible`
- **Fédération québécoise des professeures et professeurs d'université (FQPPU)** — stance `+0`, côté `con`, parent `aiedu_quebec_responsible` : La FQPPU ne rejette pas l'IA en soi, mais critique une intégration pilotée sans consultation substantielle ni moyens suffisants; elle demande que les communautés universitaires, la liberté académique et la gouvernance collégiale soient réellement intégrées aux décisions.
  Sources : `fqppu_ai_governance`
- **UNESCO — éducation et IA** — stance `+1`, côté `pro`, parent `aiedu_quebec_responsible` : L'UNESCO estime que l'IA peut soutenir l'apprentissage et l'enseignement, mais seulement dans un cadre centré sur l'humain qui protège la vie privée, l'équité, l'autonomie des apprenants et la capacité critique des enseignants et étudiants.
  Sources : `unesco_genai_guidance`

**Inventaire des sources du débat**

- `quebec_ai_education` — **Gouvernement du Québec**, *Intelligence artificielle en éducation* (2026-06-18) — https://www.quebec.ca/education/numerique/intelligence-artificielle
- `quebec_ai_tools` — **Gouvernement du Québec**, *Documents et outils sur l'IA dans le réseau de l'éducation* (2026-04-28) — https://www.quebec.ca/education/numerique/intelligence-artificielle/reseau-education/documents-outils-ia
- `quebec_digital_competency` — **Gouvernement du Québec**, *Cadre de référence de la compétence numérique* (2026-08-10) — https://www.quebec.ca/education/numerique/cadre-reference
- `ised_ai_strategy_inputs` — **Innovation, Science and Economic Development Canada**, *Engagements on Canada's next AI strategy: Summary of inputs* (2026-02-05) — https://ised-isde.canada.ca/site/ised/en/public-consultations/engagements-canadas-next-ai-strategy-summary-inputs
- `ai_advisory_learning_responsible` — **Advisory Council on Artificial Intelligence**, *Learning together for responsible artificial intelligence* (date non fixée dans le sidecar) — https://ised-isde.canada.ca/site/advisory-council-artificial-intelligence/en/public-awareness-working-group/learning-together-responsible-artificial-intelligence
- `fqppu_ai_governance` — **FQPPU**, *La FQPPU demande la démission de la ministre de l’Enseignement supérieur* (date non fixée dans le sidecar) — https://fqppu.org/la-fqppu-demande-la-demission-de-pascale-dery/
- `unesco_genai_guidance` — **UNESCO**, *Guidance for generative AI in education and research* (2026-01-16) — https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research

### 9. Le Canada et le Québec devraient-ils réduire davantage l'immigration jusqu'à ce que logement, santé et infrastructures rattrapent la croissance?

Débat sur les volumes d'immigration temporaire et permanente, la capacité d'accueil, les pénuries de main-d'œuvre, les droits des travailleurs temporaires, la francisation et l'intégration.

**Pôle + :** Réduction supplémentaire des volumes jusqu'au rattrapage de la capacité d'accueil  
**Pôle − :** Maintien de volumes plus élevés et priorité aux droits/statuts permanents plutôt qu'aux réductions

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `+1`, côté `pro` : Ottawa a réduit ses cibles de nouveaux résidents temporaires et cherche à ramener leur part de la population sous 5 %, en invoquant la nécessité de mieux aligner l'immigration sur le logement, les services et la capacité d'accueil.
  Sources : `ircc_levels_2026_2028`, `ircc_supplementary_2026_2028`
- **Gouvernement du Québec** — stance `+2`, côté `pro` : Québec veut limiter davantage les volumes temporaires et permanents afin de réduire la pression sur le logement, les services publics et la francisation, tout en ciblant les admissions selon ses priorités économiques et linguistiques.
  Sources : `quebec_immigration_2026_2029`
- **Parti conservateur du Canada** — stance `+3`, côté `pro` : Les conservateurs demandent une réduction plus marquée des volumes et une refonte du Programme des travailleurs étrangers temporaires afin que l'immigration corresponde davantage aux capacités de logement, de santé et d'emploi.
  Sources : `cpc_immigration_numbers`, `cpc_end_tfw`
- **Nouveau Parti démocratique** — stance `-1`, côté `con` : Le NPD reconnaît les problèmes du Programme des travailleurs étrangers temporaires, mais privilégie la réduction de la précarité et davantage de voies vers la résidence permanente plutôt qu'une politique générale de réduction fondée principalement sur le statut temporaire.
  Sources : `ndp_tfw_cuts`
- **Parti Québécois** — stance `+3`, côté `pro`, parent `immigration_quebec_capacity` : Le Parti Québécois propose de réduire fortement l'immigration temporaire et de ramener l'immigration permanente autour de niveaux qu'il juge compatibles avec la capacité de logement, de soins, d'éducation, de francisation et d'intégration du Québec.
  Sources : `pq_immigration_plan_2026`
- **Parti libéral du Québec** — stance `+1`, côté `pro`, parent `immigration_quebec_capacity` : Le PLQ propose de planifier l'immigration selon les besoins économiques et la capacité d'accueil propres aux régions, avec davantage de francisation; il se distingue d'une baisse uniforme des volumes en privilégiant une modulation territoriale.
  Sources : `plq_general_council_2026`
- **Bloc Québécois** — stance `+2`, côté `pro`, parent `immigration_quebec_capacity` : Le Bloc soutient que les cibles doivent correspondre à la capacité d'accueil du Québec et réclame davantage de pouvoirs québécois en immigration, notamment pour mieux arrimer les volumes aux capacités de loger, soigner, éduquer, franciser et intégrer.
  Sources : `bq_immigration_capacity_2025`

**Inventaire des sources du débat**

- `ircc_levels_2026_2028` — **Immigration, Refugees and Citizenship Canada**, *Immigration Levels Plan* (2025-11-06) — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/corporate-initiatives/levels.html
- `ircc_supplementary_2026_2028` — **Immigration, Refugees and Citizenship Canada**, *Supplementary Information for the 2026–2028 Immigration Levels Plan* (2025-11-05) — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/corporate-initiatives/levels/supplementary-immigration-levels-2026-2028.html
- `quebec_immigration_2026_2029` — **Gouvernement du Québec**, *Tabling of the 2026–2029 immigration orientations and 2026 plan* (2025-11-07) — https://www.quebec.ca/en/news/actualites/detail/tabling-orientations-immigration-2026-2029-plan-2026-complementary-measures-66844
- `cpc_immigration_numbers` — **Conservative Party of Canada**, *Carney's Out-of-Control Immigration Numbers* (date non fixée dans le sidecar) — https://www.conservative.ca/carneys-out-of-control-immigration-numbers/
- `cpc_end_tfw` — **Conservative Party of Canada**, *End the TFW Program* (date non fixée dans le sidecar) — https://www.conservative.ca/end-the-tfw-program/
- `ndp_tfw_cuts` — **New Democratic Party of Canada**, *NDP statement on Temporary Foreign Worker Program cuts* (2024-08-26) — https://www.ndp.ca/news/ndp-statement-temporary-foreign-worker-program-cuts
- `pq_immigration_plan_2026` — **Parti Québécois**, *Plan en immigration — un modèle viable* (2026) — https://pq.org/independance/plan-immigration/
- `plq_general_council_2026` — **Parti libéral du Québec**, *Conseil général du Parti libéral du Québec à Sherbrooke : Charles Milliard veut réparer le Québec* (2026-06-09) — https://plq.org/conseil-general-du-parti-liberal-du-quebec-a-sherbrooke-charles-milliard-veut-reparer-le-quebec/
- `bq_immigration_capacity_2025` — **Bloc Québécois**, *Seul le Québec peut assurer l’immigration réussie* (2025-04-21) — https://www.blocquebecois.org/seul-le-quebec-peut-assurer-limmigration-reussie/

### 10. Faut-il durcir les interdictions et la responsabilité des producteurs pour réduire les plastiques et déchets non biodégradables?

Débat sur les interdictions de plastiques à usage unique, les coûts pour les consommateurs et entreprises, la responsabilité élargie des producteurs, le recyclage et la réduction à la source.

**Pôle + :** Règles plus strictes et responsabilité accrue des producteurs  
**Pôle − :** Allègement ou retrait des interdictions pour limiter les coûts

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `+2`, côté `pro` : Le gouvernement fédéral utilise des interdictions ciblées, un registre des plastiques et des obligations de déclaration pour réduire les déchets et faire progresser la responsabilité sur l'ensemble du cycle de vie des produits.
  Sources : `canada_single_use_plastics`, `canada_plastics_registry`, `canada_plastics_amendments_2026`
- **Parti conservateur du Canada** — stance `-3`, côté `con` : Les conservateurs veulent supprimer certaines interdictions fédérales sur les plastiques et soutiennent qu'elles augmentent les coûts d'emballage et d'alimentation sans offrir un rapport coût-bénéfice suffisant.
  Sources : `cpc_plastics_packaging`
- **Ecojustice** — stance `+3`, côté `pro` : Ecojustice et des groupes environnementaux demandent de maintenir et renforcer les règles fédérales contre la pollution plastique, qu'ils considèrent nécessaires pour réduire les dommages environnementaux et sanitaires.
  Sources : `ecojustice_plastic_2026`
- **Équiterre** — stance `+3`, côté `pro`, parent `plastic_gov_regulation` : Équiterre soutient que la réduction des déchets doit remonter à la source et responsabiliser davantage les producteurs, plutôt que reposer principalement sur les gestes individuels de tri et de recyclage.
  Sources : `equiterre_production_consumption`

**Inventaire des sources du débat**

- `canada_single_use_plastics` — **Environment and Climate Change Canada**, *Single-use Plastics Prohibition Regulations — Overview* (date non fixée dans le sidecar) — https://www.canada.ca/en/environment-climate-change/services/managing-reducing-waste/reduce-plastic-waste/single-use-plastic-overview.html
- `canada_plastics_amendments_2026` — **Environment and Climate Change Canada**, *Proposed amendments to the Single-use Plastics Prohibition Regulations* (2026-03-13) — https://www.canada.ca/en/environment-climate-change/corporate/transparency/consultations/proposed-amendments-single-use-plastics-prohibition-regulations.html
- `canada_plastics_registry` — **Environment and Climate Change Canada**, *Federal Plastics Registry* (date non fixée dans le sidecar) — https://www.canada.ca/en/environment-climate-change/services/managing-reducing-waste/reduce-plastic-waste/federal-plastics-registry.html
- `cpc_plastics_packaging` — **Conservative Party of Canada**, *Axe the Food Packaging Tax* (date non fixée dans le sidecar) — https://www.conservative.ca/axe-the-food-packaging-tax/
- `ecojustice_plastic_2026` — **Ecojustice**, *Health and environmental groups celebrate victory in plastic pollution regulation case* (2026-01-30) — https://ecojustice.ca/news/health-and-environmental-groups-celebrate-victory-in-plastic-pollution-regulation-case/
- `equiterre_production_consumption` — **Équiterre**, *Production et consommation* (date non fixée dans le sidecar) — https://www.equiterre.org/fr/notre-travail/production-et-consommation

### 11. Le Québec devrait-il miser davantage sur une culture commune et la francisation que sur un modèle multiculturaliste pour renforcer la cohésion sociale?

Débat sur les modèles d'intégration, la langue française, les valeurs communes, le pluralisme, la lutte contre la discrimination et le sentiment d'appartenance.

**Pôle + :** Culture commune, français et intégration nationale comme cadre principal  
**Pôle − :** Multiculturalisme et pluralisme comme cadre principal de cohésion

**Acteurs / arguments**

- **Gouvernement du Québec** — stance `+3`, côté `pro` : La nouvelle politique québécoise d'intégration nationale met l'accent sur le français, une culture commune et l'adhésion à des repères collectifs comme fondements de l'intégration et de la cohésion sociale.
  Sources : `quebec_integration_policy_2026`, `quebec_integration_action`
- **Gouvernement du Canada** — stance `-2`, côté `con` : La politique fédérale de multiculturalisme considère le pluralisme, la lutte contre le racisme et la reconnaissance de la diversité comme des composantes de l'unité nationale et de la cohésion sociale canadienne.
  Sources : `canada_multiculturalism_overview`, `canada_multiculturalism_cohesion_2026`
- **Parti Québécois** — stance `+3`, côté `pro`, parent `cohesion_quebec_common_culture` : Le Parti Québécois lie la cohésion à l'intégration à une nation québécoise de langue française, à une politique d'immigration compatible avec la capacité d'accueil et à la protection d'un espace culturel commun, tout en affirmant vouloir lutter contre le racisme et la discrimination.
  Sources : `pq_immigration_plan_2026`, `pq_project_national_2026`
- **Bloc Québécois** — stance `+3`, côté `pro`, parent `cohesion_quebec_common_culture` : Le Bloc défend un modèle québécois d'intégration centré sur le français, la nation québécoise et l'égalité dans la diversité, qu'il oppose au cadre multiculturaliste fédéral lorsqu'il estime que celui-ci affaiblit l'intégration linguistique et culturelle.
  Sources : `bq_immigration_capacity_2025`

**Inventaire des sources du débat**

- `quebec_integration_policy_2026` — **Gouvernement du Québec**, *Politique québécoise d'intégration nationale* (2026-07-16) — https://www.quebec.ca/gouvernement/ministeres-organismes/langue-francaise/publications/politique-integration-nationale
- `quebec_integration_action` — **Gouvernement du Québec**, *Plan d'action de développement durable 2023-2028 — Immigration, francisation et intégration* (date non fixée dans le sidecar) — https://www.quebec.ca/gouvernement/ministeres-organismes/immigration/publications/plan-action-developpement-durable-2023-2028
- `canada_multiculturalism_overview` — **Canadian Heritage**, *Overview — Canadian identity, culture and multiculturalism* (date non fixée dans le sidecar) — https://www.canada.ca/en/canadian-heritage/corporate/transparency/open-government/standing-committee/guilbeault-identity-culture-september-2025/overview.html
- `canada_multiculturalism_cohesion_2026` — **Canadian Heritage**, *Other items of interest — Multiculturalism and anti-racism* (2026-06) — https://www.canada.ca/en/canadian-heritage/corporate/transparency/open-government/standing-committee/bilodeau-pacp-public-accounts-june-2026/other-items-interest.html
- `pq_immigration_plan_2026` — **Parti Québécois**, *Plan en immigration — un modèle viable* (2026) — https://pq.org/independance/plan-immigration/
- `pq_project_national_2026` — **Parti Québécois**, *Projet national — proposition principale 2026* (2026-05) — https://pq.org/wp-content/uploads/2026/05/PQ-PROPOSITION-PRINCIPALE-PROJET-NATIONAL-V5-individuel.pdf
- `bq_immigration_capacity_2025` — **Bloc Québécois**, *Seul le Québec peut assurer l’immigration réussie* (2025-04-21) — https://www.blocquebecois.org/seul-le-quebec-peut-assurer-limmigration-reussie/

### 12. Le Canada devrait-il accélérer la transition vers l'énergie propre même si cela impose des coûts aux secteurs fossiles à court terme?

Débat sur l'électrification, la réduction des émissions, le pétrole et le gaz, les technologies de captage, les coûts de l'énergie, la compétitivité et les objectifs climatiques.

**Pôle + :** Accélération de l'électrification et de la transition même avec coûts de court terme  
**Pôle − :** Transition plus graduelle maintenant une forte production d'hydrocarbures et misant sur la technologie

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `+2`, côté `pro` : Ottawa mise sur l'électricité propre, l'électrification et les investissements dans les réseaux pour réduire les émissions tout en renforçant la compétitivité d'une économie appelée à consommer beaucoup plus d'électricité.
  Sources : `canada_clean_electricity`, `canada_2030_emissions_plan`
- **Gouvernement du Québec** — stance `+3`, côté `pro` : Le Québec poursuit son Plan pour une économie verte en misant fortement sur l'électrification, l'efficacité énergétique et la réduction des émissions, avec l'hydroélectricité comme avantage stratégique.
  Sources : `quebec_green_economy_plan`, `quebec_green_implementation`
- **Gouvernement de l'Alberta** — stance `-1`, côté `con` : L'Alberta privilégie une trajectoire qui combine réduction d'émissions, tarification industrielle, captage du carbone et technologies propres avec le maintien ou l'augmentation de la production pétrolière; elle rejette une transition fondée sur une sortie rapide des hydrocarbures.
  Sources : `alberta_tier`, `alberta_west_coast_pipeline`
- **Parti Québécois** — stance `+3`, côté `pro`, parent `climate_quebec_green_plan` : Le Parti Québécois propose une transition verte plus contraignante, avec budget carbone, test climat, électrification, efficacité énergétique, hausse de la production renouvelable et réduction de l'utilisation des combustibles fossiles dans l'industrie.
  Sources : `pq_project_national_2026`
- **Québec solidaire** — stance `+3`, côté `pro`, parent `climate_quebec_green_plan` : Québec solidaire défend une transition sociale et écologique rapide fondée sur le transport collectif électrifié, la sortie des hydrocarbures, le développement des énergies renouvelables et une planification avec les travailleurs, les communautés vulnérables et les peuples autochtones.
  Sources : `qs_workers_manifest`
- **Équiterre** — stance `+3`, côté `pro`, parent `climate_quebec_green_plan` : Équiterre demande une politique climatique plus ambitieuse et plus cohérente, notamment un marché du carbone plus efficace et des décisions de grands projets qui n'affaiblissent pas les protections environnementales au nom de la vitesse.
  Sources : `equiterre_spede_2026`, `equiterre_major_projects_2026`

**Inventaire des sources du débat**

- `canada_clean_electricity` — **Government of Canada**, *Clean electricity* (2026-05-27) — https://www.canada.ca/en/services/environment/weather/climatechange/climate-plan/clean-electricity.html
- `canada_2030_emissions_plan` — **Government of Canada**, *2030 Emissions Reduction Plan* (date non fixée dans le sidecar) — https://www.canada.ca/en/services/environment/weather/climatechange/climate-plan/climate-plan-overview/emissions-reduction-2030.html
- `quebec_green_economy_plan` — **Gouvernement du Québec**, *Plan pour une économie verte 2030* (2026-07-29) — https://www.quebec.ca/gouvernement/politiques-orientations/plan-economie-verte
- `quebec_green_implementation` — **Gouvernement du Québec**, *Plan de mise en œuvre du Plan pour une économie verte* (2026-06-29) — https://www.quebec.ca/gouvernement/politiques-orientations/plan-economie-verte/plan-mise-en-oeuvre
- `alberta_tier` — **Government of Alberta**, *Technology Innovation and Emissions Reduction Regulation* (date non fixée dans le sidecar) — https://www.alberta.ca/technology-innovation-and-emissions-reduction-regulation
- `alberta_west_coast_pipeline` — **Government of Alberta**, *West Coast oil pipeline* (2026-07) — https://www.alberta.ca/west-coast-oil-pipeline
- `pq_project_national_2026` — **Parti Québécois**, *Projet national — proposition principale 2026* (2026-05) — https://pq.org/wp-content/uploads/2026/05/PQ-PROPOSITION-PRINCIPALE-PROJET-NATIONAL-V5-individuel.pdf
- `qs_workers_manifest` — **Québec solidaire**, *Manifeste pour un Québec solidaire de ses travailleuses et travailleurs* (date non fixée dans le sidecar) — https://appuyez.quebecsolidaire.net/manifeste
- `equiterre_spede_2026` — **Équiterre**, *Une réforme qui manque d’ambition* (2026-07-14) — https://www.equiterre.org/fr/ressources/601-recommandation-politique-reforme-spede
- `equiterre_major_projects_2026` — **Équiterre**, *Comment bâtir un Canada fort en freinant la transition?* (2026-06-15) — https://www.equiterre.org/fr/ressources/comment-b%C3%A2tir-un-canada-fort-en-freinant-la-transition

### 13. Le Canada devrait-il adopter une politique industrielle plus interventionniste pour conserver au pays l'IA, la propriété intellectuelle, les données et les entreprises technologiques?

Débat sur la commercialisation de la recherche, la propriété intellectuelle, l'adoption de l'IA, les infrastructures de calcul, les marchés publics, le capital de croissance et la souveraineté technologique.

**Pôle + :** Politique industrielle et souveraineté technologique plus interventionnistes  
**Pôle − :** Approche davantage fondée sur le marché et l'ouverture internationale du capital et des actifs

**Acteurs / arguments**

- **Gouvernement du Canada** — stance `+2`, côté `pro` : La stratégie fédérale sur l'IA vise à augmenter fortement l'adoption de l'IA par les entreprises, développer les compétences et renforcer les infrastructures de calcul et les capacités nationales afin de convertir la recherche canadienne en gains économiques.
  Sources : `ised_national_ai_strategy_2026`
- **Council of Canadian Innovators** — stance `+3`, côté `pro` : Le Council of Canadian Innovators demande une politique plus explicite de souveraineté économique : conserver la propriété intellectuelle et les données au Canada, utiliser les marchés publics pour faire grandir les entreprises locales et soutenir leur passage à l'échelle.
  Sources : `cci_innovation_power_2026`, `cci_quebec_election_2026`, `cci_public_procurement`
- **Statistique Canada** — stance `+0`, côté `neutral` : Les travaux de Statistique Canada montrent à la fois le potentiel de l'IA pour relever la croissance de la productivité et la faiblesse persistante de la productivité canadienne, ce qui fait de l'adoption et de la diffusion technologique un enjeu central.
  Sources : `statcan_ai_productivity_2026`, `statcan_productivity_competition_2026`

**Inventaire des sources du débat**

- `ised_national_ai_strategy_2026` — **Innovation, Science and Economic Development Canada**, *Canada's National Artificial Intelligence Strategy* (2026-06-08) — https://ised-isde.canada.ca/site/ised/en/canadas-national-artificial-intelligence-strategy-ai-all
- `statcan_ai_productivity_2026` — **Statistics Canada**, *Artificial intelligence and productivity growth in Canada* (2026-04-22) — https://www150.statcan.gc.ca/n1/pub/36-28-0001/2026004/article/00002-eng.htm
- `statcan_productivity_competition_2026` — **Statistics Canada**, *Productivity and competition in Canada* (2026) — https://www150.statcan.gc.ca/n1/pub/11f0019m/11f0019m2026002-eng.htm
- `cci_innovation_power_2026` — **Council of Canadian Innovators**, *Innovation as Power: The Choices That Will Define 2026* (2026-01-16) — https://www.canadianinnovators.org/content/innovation-as-power-the-choices-that-will-define-2026
- `cci_quebec_election_2026` — **Council of Canadian Innovators**, *2026 Quebec Election Primer: What Innovators Need to Scale* (2026-07-16) — https://www.canadianinnovators.org/content/2026-quebec-election-primer-what-innovators-need-to-scale
- `cci_public_procurement` — **Council of Canadian Innovators**, *Buying What We Build: A CCI Policy Report on Public Buying for Canadian Innovation and Prosperity* (date non fixée dans le sidecar) — https://www.canadianinnovators.org/content/buying-what-we-build-a-cci-policy-report-on-public-buying-for-canadian-innovation-and-prosperity
