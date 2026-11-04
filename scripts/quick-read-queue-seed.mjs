/**
 * Curated Quick Read seed topics — companions with distinct angles + a few standalone.
 * Merged by id into content/quick-read-queue.json during replenishment.
 */

function qr(
  id,
  title,
  hook,
  category,
  angle,
  editorialAngle,
  parentArticleSlug,
  keywords,
  requiredSources,
  imageSearchTerms,
  extras = {}
) {
  return {
    id,
    title,
    hook,
    category,
    angle,
    editorialAngle,
    parentArticleSlug,
    relatedArticleSlugs: parentArticleSlug ? [parentArticleSlug] : [],
    keywords,
    requiredSources,
    imageSearchTerms,
    status: "pending",
    format: "quick-read",
    ...extras,
  };
}

export const QR_QUEUE_SEED = [
  qr(
    "qr-peshtigo-same-day-chicago",
    "Peshtigo Burned the Same Day as Chicago — and Almost Nobody Noticed",
    "America’s deadliest wildfire hit Wisconsin the same day as the Great Chicago Fire — and was overshadowed for generations.",
    "Weird America",
    "Focus only on the coincidence of dates and why Chicago dominated headlines; not a full Peshtigo narrative.",
    "Same-day overshadowing of Peshtigo by Chicago Fire news",
    "peshtigo-fire-1871",
    ["Peshtigo fire same day Chicago", "Peshtigo vs Chicago 1871"],
    [
      { title: "Peshtigo Fire", publisher: "National Weather Service", url: "https://www.weather.gov/grb/peshtigofire" },
      { title: "Great Chicago Fire", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/october-08/" },
      { title: "Peshtigo Fire Museum / Wisconsin history", publisher: "Wisconsin Historical Society", url: "https://www.wisconsinhistory.org/" },
    ],
    ["Peshtigo fire 1871"],
    { eventYear: 1871, historicalEra: "reconstruction-gilded-age", canonicalEventId: "peshtigo-chicago-same-day::1871" }
  ),
  qr(
    "qr-challenger-o-ring-cold",
    "The Cold Morning That Doomed Challenger’s O-Rings",
    "Engineers warned that freezing temperatures could fail Challenger’s booster seals — and the January launch went ahead anyway.",
    "Weird America",
    "One technical failure mode and the temperature debate — not the full shuttle program story.",
    "O-ring cold-temperature failure as Challenger ignition cause",
    "challenger-disaster-1986",
    ["Challenger O-ring cold", "Challenger Rogers Commission O-ring"],
    [
      { title: "Rogers Commission Report", publisher: "NASA", url: "https://www.nasa.gov/history/rogersrep/genindex.htm" },
      { title: "Challenger", publisher: "Smithsonian National Air and Space Museum", url: "https://airandspace.si.edu/" },
      { title: "STS-51-L", publisher: "NASA", url: "https://www.nasa.gov/mission_pages/shuttle/shuttlemissions/archives/sts-51L.html" },
    ],
    ["Challenger O-ring 1986"],
    { eventYear: 1986, historicalEra: "postwar-cold-war", canonicalEventId: "challenger-oring-cold::1986" }
  ),
  qr(
    "qr-johnstown-south-fork-club",
    "The South Fork Club Dam: Privilege Above Johnstown",
    "A private resort club altered a dam above Johnstown — then largely escaped liability after the flood.",
    "Weird America",
    "Club ownership, dam modifications, and liability outcome — not the full flood chronology.",
    "South Fork Fishing and Hunting Club dam liability after Johnstown Flood",
    "johnstown-flood-1889",
    ["Johnstown Flood South Fork Club", "South Fork dam lawsuit"],
    [
      { title: "Johnstown Flood", publisher: "National Park Service", url: "https://www.nps.gov/jofl/learn/historyculture/index.htm" },
      { title: "Johnstown Flood", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/may-31/" },
      { title: "Johnstown Area Heritage Association", publisher: "JAHA", url: "https://www.jaha.org/" },
    ],
    ["Johnstown Flood South Fork dam"],
    { eventYear: 1889, historicalEra: "reconstruction-gilded-age", canonicalEventId: "johnstown-south-fork-club::1889" }
  ),
  qr(
    "qr-cocoanut-grove-exit",
    "Why Cocoanut Grove’s Exits Failed When Fire Hit",
    "A revolving door and blocked exits turned a nightclub blaze into America’s deadliest club fire.",
    "Weird America",
    "Exit design and locked/blocked egress only — not the full victim narrative.",
    "Revolving door and blocked exits at Cocoanut Grove fire",
    "cocoanut-grove-fire-1942",
    ["Cocoanut Grove revolving door", "Cocoanut Grove exits"],
    [
      { title: "Cocoanut Grove Fire", publisher: "National Fire Protection Association", url: "https://www.nfpa.org/" },
      { title: "Cocoanut Grove", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Boston fire history", publisher: "National Archives", url: "https://www.archives.gov/" },
    ],
    ["Cocoanut Grove fire exits 1942"],
    { eventYear: 1942, historicalEra: "world-war-ii", canonicalEventId: "cocoanut-grove-exits::1942" }
  ),
  qr(
    "qr-apollo1-hatch",
    "The Inward Hatch That Trapped Apollo 1’s Crew",
    "Apollo 1’s cabin hatch opened inward under pressure — and the crew could not escape the pad fire.",
    "Weird America",
    "Hatch design and escape impossibility during the pad fire — not the full program rebuild.",
    "Inward-opening hatch as Apollo 1 escape barrier",
    "apollo-1-fire-1967",
    ["Apollo 1 hatch", "Apollo 1 cabin fire hatch"],
    [
      { title: "Apollo 1", publisher: "NASA", url: "https://www.nasa.gov/mission_pages/apollo/missions/apollo1.html" },
      { title: "Apollo 1 fire", publisher: "Smithsonian National Air and Space Museum", url: "https://airandspace.si.edu/" },
      { title: "Apollo program", publisher: "National Archives", url: "https://www.archives.gov/" },
    ],
    ["Apollo 1 hatch 1967"],
    { eventYear: 1967, historicalEra: "postwar-cold-war", canonicalEventId: "apollo1-hatch::1967" }
  ),
  qr(
    "qr-goldsboro-one-switch",
    "The Goldsboro Bomb That Was One Switch From Arming",
    "After a B-52 broke up over North Carolina, one nuclear bomb’s arming sequence stopped at a single switch.",
    "Military",
    "The intact switch detail from declassified accounts — not the full Goldsboro narrative.",
    "Single arming switch that prevented Goldsboro bomb detonation",
    "goldsboro-nuclear-accident-1961",
    ["Goldsboro nuclear bomb switch", "Goldsboro 1961 arming"],
    [
      { title: "Goldsboro broken arrow", publisher: "U.S. Air Force historical materials", url: "https://www.afhistory.af.mil/" },
      { title: "Nuclear weapons accidents", publisher: "National Security Archive", url: "https://nsarchive.gwu.edu/" },
      { title: "Broken Arrow", publisher: "Department of Defense FOIA / National Archives", url: "https://www.archives.gov/" },
    ],
    ["Goldsboro nuclear accident switch"],
    { eventYear: 1961, historicalEra: "postwar-cold-war", canonicalEventId: "goldsboro-switch::1961" }
  ),
  qr(
    "qr-palomares-missing-bomb",
    "The Palomares Bomb That Hid Underwater for Months",
    "After a midair collision over Spain, one U.S. hydrogen bomb stayed lost at sea until a Navy search recovered it.",
    "Military",
    "The missing fourth bomb and underwater recovery — not the full Palomares contamination story.",
    "Underwater recovery of the missing Palomares hydrogen bomb",
    "palomares-incident-1966",
    ["Palomares missing bomb", "Palomares Alvin recovery"],
    [
      { title: "Palomares", publisher: "U.S. Air Force historical materials", url: "https://www.afhistory.af.mil/" },
      { title: "Palomares incident", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Naval History", publisher: "Naval History and Heritage Command", url: "https://www.history.navy.mil/" },
    ],
    ["Palomares missing bomb 1966"],
    { eventYear: 1966, historicalEra: "postwar-cold-war", canonicalEventId: "palomares-missing-bomb::1966" }
  ),
  qr(
    "qr-indianapolis-delayed-rescue",
    "Why Help Took So Long After Indianapolis Sank",
    "Survivors of USS Indianapolis drifted for days — because the Navy did not know the cruiser was overdue.",
    "Military",
    "Radio silence, routing secrecy, and delayed distress recognition — not the shark attacks retelling.",
    "Delayed discovery that USS Indianapolis was overdue after sinking",
    "uss-indianapolis-1945",
    ["USS Indianapolis delayed rescue", "Indianapolis overdue 1945"],
    [
      { title: "USS Indianapolis", publisher: "Naval History and Heritage Command", url: "https://www.history.navy.mil/research/histories/ship-histories/danfs/i/indianapolis-ca-35.html" },
      { title: "USS Indianapolis", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "World War II Navy", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["USS Indianapolis delayed rescue"],
    { eventYear: 1945, historicalEra: "world-war-ii", canonicalEventId: "indianapolis-delayed-rescue::1945" }
  ),
  qr(
    "qr-three-mile-hydrogen-bubble",
    "The Hydrogen Bubble Scare Inside Three Mile Island",
    "During TMI, engineers feared a hydrogen bubble could explode inside the reactor vessel — a crisis within the crisis.",
    "Weird America",
    "Hydrogen bubble concern and how it was assessed — not the full accident timeline.",
    "Hydrogen bubble concern during Three Mile Island accident",
    "three-mile-island-1979",
    ["Three Mile Island hydrogen bubble", "TMI hydrogen"],
    [
      { title: "Three Mile Island", publisher: "NRC", url: "https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle.html" },
      { title: "TMI accident", publisher: "NRC historical", url: "https://www.nrc.gov/" },
      { title: "Three Mile Island", publisher: "National Archives", url: "https://www.archives.gov/" },
    ],
    ["Three Mile Island hydrogen bubble"],
    { eventYear: 1979, historicalEra: "postwar-cold-war", canonicalEventId: "tmi-hydrogen-bubble::1979" }
  ),
  qr(
    "qr-exxon-valdez-response-delay",
    "The Hours That Mattered After Exxon Valdez Grounded",
    "After the tanker hit Bligh Reef, critics said containment boom and response came too slowly to limit the oil’s spread.",
    "Weird America",
    "Early response timing and boom deployment debates — not the full spill ecology story.",
    "Delayed containment response after Exxon Valdez grounding",
    "exxon-valdez-oil-spill-1989",
    ["Exxon Valdez response delay", "Exxon Valdez boom"],
    [
      { title: "Exxon Valdez Oil Spill", publisher: "NOAA", url: "https://response.restoration.noaa.gov/oil-and-chemical-spills/significant-incidents/exxon-valdez-oil-spill" },
      { title: "Exxon Valdez", publisher: "EPA", url: "https://www.epa.gov/" },
      { title: "Spill response", publisher: "National Archives", url: "https://www.archives.gov/" },
    ],
    ["Exxon Valdez response 1989"],
    { eventYear: 1989, historicalEra: "postwar-cold-war", canonicalEventId: "exxon-valdez-response::1989" }
  ),
  qr(
    "qr-hartford-waterproofing",
    "The Waterproofing That Helped the Hartford Circus Tent Burn",
    "Paraffin and gasoline waterproofing made the big top shed rain — and turned it into fuel when fire started.",
    "Weird America",
    "Tent waterproofing chemistry/practice as fire accelerant — not the full victim list.",
    "Paraffin-gasoline waterproofing of Hartford circus tent",
    "hartford-circus-fire-1944",
    ["Hartford circus tent waterproofing", "Hartford circus paraffin"],
    [
      { title: "Hartford Circus Fire", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/july-06/" },
      { title: "Hartford circus fire", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Circus fire disaster history", publisher: "National Park Service", url: "https://www.nps.gov/" },
    ],
    ["Hartford circus fire waterproofing"],
    { eventYear: 1944, historicalEra: "world-war-ii", canonicalEventId: "hartford-waterproofing::1944" }
  ),
  qr(
    "qr-eastland-stability",
    "Why Eastland Rolled Over at the Dock",
    "SS Eastland capsized in the Chicago River while still tied up — a stability failure, not a storm at sea.",
    "Weird America",
    "Top-heavy stability and dockside listing — not the full passenger tragedy retelling.",
    "Stability design failure that capsized Eastland at dock",
    "eastland-disaster-1915",
    ["Eastland stability", "Eastland capsized Chicago River"],
    [
      { title: "Eastland Disaster", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Eastland", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Chicago River disaster", publisher: "Chicago History Museum", url: "https://www.chicagohistory.org/" },
    ],
    ["Eastland disaster stability 1915"],
    { eventYear: 1915, historicalEra: "progressive-wwi", canonicalEventId: "eastland-stability::1915" }
  ),
  qr(
    "qr-tulsa-airplanes",
    "Airplanes Over Greenwood: What Witnesses Reported in 1921",
    "During the Tulsa Race Massacre, survivors described aircraft over Greenwood — a detail still debated in scope.",
    "Crime",
    "Aircraft reports from contemporary and later testimony — carefully bounded; not the full massacre narrative.",
    "Aircraft over Greenwood during Tulsa Race Massacre",
    "tulsa-race-massacre-1921",
    ["Tulsa Race Massacre airplanes", "Greenwood planes 1921"],
    [
      { title: "Tulsa Race Massacre", publisher: "National Archives", url: "https://www.archives.gov/research/african-americans/oklahoma-tulsa-race-massacre" },
      { title: "1921 Tulsa Race Massacre", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Tulsa Historical Society", publisher: "Tulsa Historical Society & Museum", url: "https://www.tulsahistory.org/" },
    ],
    ["Tulsa Race Massacre airplanes"],
    { eventYear: 1921, historicalEra: "twenties-depression", canonicalEventId: "tulsa-airplanes::1921" }
  ),
  qr(
    "qr-my-lai-helicopter",
    "The Helicopter Crew That Interrupted My Lai",
    "Warrant Officer Hugh Thompson landed between soldiers and civilians at My Lai — and ordered his crew to protect survivors.",
    "Military",
    "Thompson’s intervention only — not the full massacre investigation.",
    "Hugh Thompson helicopter intervention at My Lai",
    "my-lai-massacre-1968",
    ["Hugh Thompson My Lai", "My Lai helicopter intervention"],
    [
      { title: "My Lai", publisher: "U.S. Army Center of Military History", url: "https://history.army.mil/" },
      { title: "Vietnam War crimes investigations", publisher: "National Archives", url: "https://www.archives.gov/research/military/vietnam-war" },
      { title: "My Lai", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Hugh Thompson My Lai"],
    { eventYear: 1968, historicalEra: "postwar-cold-war", canonicalEventId: "my-lai-thompson::1968" }
  ),
  qr(
    "qr-black-tom-liberty",
    "Black Tom’s Blast That Scarred the Statue of Liberty",
    "The 1916 Black Tom munitions explosion damaged the Statue of Liberty’s skirt and closed her torch to visitors.",
    "Military",
    "Statue of Liberty damage from Black Tom — not the full sabotage investigation.",
    "Statue of Liberty damage from Black Tom explosion",
    "black-tom-explosion-1916",
    ["Black Tom Statue of Liberty", "Black Tom Liberty torch"],
    [
      { title: "Black Tom Explosion", publisher: "National Park Service", url: "https://www.nps.gov/articles/black-tom.htm" },
      { title: "Statue of Liberty", publisher: "National Park Service", url: "https://www.nps.gov/stli/" },
      { title: "Black Tom", publisher: "National Archives", url: "https://www.archives.gov/" },
    ],
    ["Black Tom Statue of Liberty damage"],
    { eventYear: 1916, historicalEra: "progressive-wwi", canonicalEventId: "black-tom-liberty::1916" }
  ),
  qr(
    "qr-donner-forlorn-hope",
    "The Forlorn Hope: The Donner Party’s Desperate Snowshoe Party",
    "Fifteen people left the stranded Donner camps on snowshoes — a desperate breakout that cost most of their lives.",
    "Weird America",
    "The snowshoe party’s departure and losses — not the full Donner winter narrative.",
    "Forlorn Hope snowshoe party from Donner camps",
    "donner-party-1846",
    ["Donner Party Forlorn Hope", "Donner snowshoe party"],
    [
      { title: "Donner Party", publisher: "National Park Service", url: "https://www.nps.gov/articles/000/the-donner-party.htm" },
      { title: "Donner Memorial", publisher: "California State Parks", url: "https://www.parks.ca.gov/" },
      { title: "Donner Party", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Donner Party Forlorn Hope"],
    { eventYear: 1846, historicalEra: "antebellum-civil-war", canonicalEventId: "donner-forlorn-hope::1846" }
  ),
  qr(
    "qr-triangle-fire-escape",
    "The Fire Escape That Collapsed at Triangle",
    "At Triangle Shirtwaist, a rear fire escape peeled away from the building — dropping workers into the courtyard.",
    "Crime",
    "Fire-escape failure as a distinct mechanical detail — companion to the locked-door Quick Read, not a repeat.",
    "Collapsing rear fire escape during Triangle Shirtwaist fire",
    "triangle-shirtwaist-fire-1911",
    ["Triangle fire escape collapse", "Triangle Shirtwaist fire escape"],
    [
      { title: "Triangle Shirtwaist Factory Fire", publisher: "U.S. Department of Labor", url: "https://www.dol.gov/general/aboutdol/history/trianglefire" },
      { title: "Remembering the Triangle Fire", publisher: "Cornell ILR", url: "https://trianglefire.ilr.cornell.edu/" },
      { title: "Triangle fire", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Triangle Shirtwaist fire escape"],
    { eventYear: 1911, historicalEra: "progressive-wwi", canonicalEventId: "triangle-fire-escape::1911" }
  ),
  qr(
    "qr-kent-state-guard-orders",
    "What the Guard Was Ordered to Do at Kent State",
    "On May 4, 1970, Ohio National Guard troops on campus opened fire — after orders and a tense advance that still fuels debate.",
    "Politics",
    "Orders and the moments before the volley — not a full campus-politics essay.",
    "National Guard orders and advance before Kent State shootings",
    "kent-state-shootings-1970",
    ["Kent State National Guard orders", "Kent State May 4"],
    [
      { title: "Kent State shootings", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Kent State", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "May 4 Collection", publisher: "Kent State University Libraries", url: "https://www.library.kent.edu/special-collections-and-archives/may-4-collection" },
    ],
    ["Kent State Guard 1970"],
    { eventYear: 1970, historicalEra: "postwar-cold-war", canonicalEventId: "kent-state-orders::1970" }
  ),
];
