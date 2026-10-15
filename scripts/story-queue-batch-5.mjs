/**
 * Fifth curated batch — refill after queue hit zero pending (Oct 2026).
 * Sourced from docs/search-growth-plan.md topics not yet published.
 * Target: restore ≥30 pending reserve.
 */

function item(
  id,
  title,
  hook,
  category,
  angle,
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
    keywords,
    requiredSources,
    imageSearchTerms,
    status: "pending",
    publishedSlug: null,
    publishedAt: null,
    ...extras,
  };
}

export const QUEUE_BATCH_5 = [
  item(
    "gaspee-affair-1772",
    "The Gaspee Affair of 1772: Colonists Burned a British Customs Ship",
    "Rhode Island colonists boarded and burned HMS Gaspee — an early flashpoint before Lexington.",
    "Revolution",
    "Why the schooner ran aground, who led the raid, how Britain investigated, and why it mattered for independence.",
    ["Gaspee Affair", "HMS Gaspee Rhode Island", "Burning of the Gaspee"],
    [
      { title: "The Gaspee Affair", publisher: "National Park Service", url: "https://www.nps.gov/articles/000/the-gaspee-affair.htm" },
      { title: "Gaspee Days", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/june-09/" },
      { title: "The Burning of the Gaspee", publisher: "Rhode Island Historical Society", url: "https://www.rihs.org/" },
      { title: "Gaspee Affair", publisher: "U.S. Naval Institute", url: "https://www.usni.org/" },
      { title: "Prelude to Revolution", publisher: "National Archives", url: "https://www.archives.gov/research/american-revolution" },
    ],
    ["Gaspee Affair HMS Gaspee burning 1772"],
    { eventYear: 1772, historicalEra: "colonial-america" }
  ),
  item(
    "newburgh-conspiracy-1783",
    "The Newburgh Conspiracy: When Continental Officers Nearly Mutinied",
    "Unpaid officers circulated a call to defy Congress — until Washington’s speech stopped them.",
    "Revolution",
    "What the anonymous letters proposed, Washington’s Newburgh address, and how Congress settled pay.",
    ["Newburgh Conspiracy", "Washington Newburgh address", "Continental Army mutiny"],
    [
      { title: "Newburgh Address", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/march-15/" },
      { title: "Washington and the Newburgh Conspiracy", publisher: "National Archives", url: "https://www.archives.gov/founding-docs" },
      { title: "Newburgh Conspiracy", publisher: "Mount Vernon", url: "https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/newburgh-conspiracy" },
      { title: "Continental Army", publisher: "National Park Service", url: "https://www.nps.gov/articles/continental-army.htm" },
      { title: "Founders Online", publisher: "National Archives", url: "https://founders.archives.gov/" },
    ],
    ["Washington Newburgh Conspiracy 1783"],
    { eventYear: 1783, historicalEra: "revolution-early-republic" }
  ),
  item(
    "benedict-arnold-west-point-1780",
    "Benedict Arnold’s West Point Plot: What He Tried to Sell the British",
    "America’s most famous traitor tried to hand West Point to the British — and nearly got away with it.",
    "Revolution",
    "Arnold’s grievances, the André capture, what papers proved, and how the plot collapsed.",
    ["Benedict Arnold West Point", "John André spy", "Arnold treason 1780"],
    [
      { title: "Benedict Arnold", publisher: "National Park Service", url: "https://www.nps.gov/articles/benedict-arnold.htm" },
      { title: "West Point and Arnold", publisher: "U.S. Military Academy", url: "https://www.westpoint.edu/" },
      { title: "John André", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Revolutionary War spies", publisher: "National Archives", url: "https://www.archives.gov/research/american-revolution" },
      { title: "Arnold treason", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Benedict Arnold West Point plot 1780"],
    { eventYear: 1780, historicalEra: "revolution-early-republic" }
  ),
  item(
    "paxton-boys-1763",
    "The Paxton Boys: Frontier Massacre and a March on Philadelphia",
    "After killing Conestoga people in Lancaster, armed settlers marched on Philadelphia — and nearly sparked civil war in Pennsylvania.",
    "Revolution",
    "The Conestoga killings, Franklin’s defense of Philadelphia, and what the crisis revealed about colonial politics.",
    ["Paxton Boys", "Conestoga massacre", "Paxton Boys Philadelphia"],
    [
      { title: "Paxton Boys", publisher: "Encyclopedia of Greater Philadelphia", url: "https://philadelphiaencyclopedia.org/archive/paxton-boys/" },
      { title: "Conestoga Indian Town", publisher: "Pennsylvania Historical & Museum Commission", url: "https://www.phmc.pa.gov/" },
      { title: "Benjamin Franklin and the Paxton Boys", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Colonial Pennsylvania", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Frontier violence", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Paxton Boys Conestoga 1763"],
    { eventYear: 1763, historicalEra: "colonial-america" }
  ),
  item(
    "able-archer-83",
    "Able Archer 83: The NATO Exercise That Nearly Looked Like Nuclear War",
    "A realistic 1983 NATO command exercise rattled U.S.–Warsaw Pact intelligence channels during a tense nuclear scare year.",
    "Military",
    "What Able Archer simulated, why opposing analysts misread the drill, and what declassified U.S. files show about the scare.",
    ["Able Archer 83", "Able Archer nuclear scare", "NATO exercise 1983"],
    [
      { title: "Able Archer 83", publisher: "National Security Archive", url: "https://nsarchive.gwu.edu/briefing-book/aa83" },
      { title: "The 1983 War Scare", publisher: "CIA FOIA Reading Room", url: "https://www.cia.gov/readingroom/" },
      { title: "Cold War nuclear crises", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Able Archer", publisher: "U.S. Department of State Office of the Historian", url: "https://history.state.gov/" },
      { title: "Nuclear close calls", publisher: "Bulletin of the Atomic Scientists", url: "https://thebulletin.org/" },
    ],
    ["Able Archer 83 NATO exercise"],
    { eventYear: 1983, historicalEra: "postwar-cold-war" }
  ),
  item(
    "palomares-incident-1966",
    "Palomares 1966: When a U.S. Bomber Lost Hydrogen Bombs Over Spain",
    "A midair collision dumped nuclear weapons near a Spanish fishing village — one bomb vanished into the Mediterranean for months.",
    "Military",
    "The B-52/KC-135 collision, the land recovery, the underwater search, and what the U.S. admitted.",
    ["Palomares hydrogen bomb", "Palomares 1966", "B-52 Spain nuclear accident"],
    [
      { title: "Palomares Nuclear Weapons Accident", publisher: "U.S. Air Force", url: "https://www.af.mil/" },
      { title: "Broken Arrow incidents", publisher: "Department of Defense", url: "https://www.defense.gov/" },
      { title: "Palomares", publisher: "National Security Archive", url: "https://nsarchive.gwu.edu/" },
      { title: "Nuclear weapons accidents", publisher: "Federation of American Scientists", url: "https://fas.org/" },
      { title: "Cold War nuclear accidents", publisher: "Atomic Heritage Foundation", url: "https://ahf.nuclearmuseum.org/" },
    ],
    ["Palomares Spain hydrogen bomb 1966"],
    { eventYear: 1966, historicalEra: "postwar-cold-war" }
  ),
  item(
    "thule-b52-crash-1968",
    "The Thule B-52 Crash: A Nuclear Bomber Went Down on Greenland Ice",
    "In 1968 a B-52 carrying nuclear weapons crashed near Thule Air Base — contaminating ice and forcing a massive cleanup.",
    "Military",
    "Why the bomber was airborne, what burned, the cleanup deal with Denmark, and declassified aftermath.",
    ["Thule B-52 crash", "Thule nuclear accident 1968", "Broken Arrow Greenland"],
    [
      { title: "Thule Accident", publisher: "U.S. Air Force Historical Research", url: "https://www.af.mil/" },
      { title: "Broken Arrow", publisher: "Department of Defense", url: "https://www.defense.gov/" },
      { title: "Thule crash", publisher: "National Security Archive", url: "https://nsarchive.gwu.edu/" },
      { title: "Nuclear weapons accidents", publisher: "Atomic Heritage Foundation", url: "https://ahf.nuclearmuseum.org/" },
      { title: "Greenland cleanup", publisher: "State Department historical materials", url: "https://history.state.gov/" },
    ],
    ["Thule B-52 crash Greenland 1968"],
    { eventYear: 1968, historicalEra: "postwar-cold-war" }
  ),
  item(
    "uss-forrestal-fire-1967",
    "The USS Forrestal Fire: A Carrier Deck Inferno That Killed 134",
    "A Zuni rocket misfire on Yankee Station started a chain of explosions that nearly destroyed a supercarrier.",
    "Military",
    "How the fire started, why bombs cooked off, damage-control lessons, and the Navy’s official investigation.",
    ["USS Forrestal fire", "Forrestal fire 1967", "carrier deck fire Vietnam"],
    [
      { title: "USS Forrestal (CVA-59)", publisher: "Naval History and Heritage Command", url: "https://www.history.navy.mil/research/histories/ship-histories/danfs/f/forrestal-cva-59.html" },
      { title: "Forrestal fire", publisher: "U.S. Navy", url: "https://www.navy.mil/" },
      { title: "Carrier fires", publisher: "Naval History and Heritage Command", url: "https://www.history.navy.mil/" },
      { title: "Vietnam War naval operations", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Forrestal disaster", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["USS Forrestal fire 1967"],
    { eventYear: 1967, historicalEra: "postwar-cold-war" }
  ),
  item(
    "iroquois-theatre-fire-wait",
    "placeholder-skip",
    "skip",
    "Weird America",
    "skip",
    [],
    [],
    []
  ),
];

// Remove accidental placeholder — build clean array without it
QUEUE_BATCH_5.splice(
  QUEUE_BATCH_5.findIndex((i) => i.id === "iroquois-theatre-fire-wait"),
  1
);

QUEUE_BATCH_5.push(
  item(
    "great-seattle-fire-1889",
    "The Great Seattle Fire of 1889: How a City Burned and Rebuilt in Brick",
    "A glue pot in a cabinet shop ignited a blaze that leveled Seattle’s business district — and forced a rebuild above the ashes.",
    "Weird America",
    "How the fire spread, why wooden sidewalks doomed the city, and how Seattle raised its streets afterward.",
    ["Seattle fire 1889", "Great Seattle Fire", "Seattle rebuilt brick"],
    [
      { title: "Great Seattle Fire", publisher: "Seattle Municipal Archives", url: "https://www.seattle.gov/cityarchives" },
      { title: "Seattle Fire of 1889", publisher: "HistoryLink", url: "https://www.historylink.org/" },
      { title: "Urban fires", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Pacific Northwest history", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Seattle rebuild", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Great Seattle Fire 1889"],
    { eventYear: 1889, historicalEra: "reconstruction-gilded-age" }
  ),
  item(
    "hinckley-fire-1894",
    "The Hinckley Firestorm of 1894: A Train Escape Through a Burning Forest",
    "A Minnesota firestorm killed hundreds — and a train engineer raced survivors through flames to safety.",
    "Weird America",
    "Drought conditions, the fire’s path, the train escape, and how communities recorded the dead.",
    ["Hinckley fire 1894", "Hinckley firestorm Minnesota", "Great Hinckley Fire"],
    [
      { title: "Great Hinckley Fire", publisher: "Minnesota Historical Society", url: "https://www.mnhs.org/" },
      { title: "Hinckley Fire", publisher: "National Weather Service", url: "https://www.weather.gov/" },
      { title: "Forest fire history", publisher: "U.S. Forest Service", url: "https://www.fs.usda.gov/" },
      { title: "Minnesota disasters", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Hinckley firestorm", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Hinckley Fire Minnesota 1894"],
    { eventYear: 1894, historicalEra: "reconstruction-gilded-age" }
  ),
  item(
    "winecoff-hotel-fire-1946",
    "The Winecoff Hotel Fire: America’s Deadliest Hotel Blaze",
    "Atlanta’s “fireproof” Winecoff Hotel burned in 1946, killing 119 people and rewriting hotel safety codes.",
    "Weird America",
    "Why exits failed, how guests jumped, the death toll, and the code changes that followed.",
    ["Winecoff Hotel fire", "Winecoff fire Atlanta 1946", "deadliest hotel fire"],
    [
      { title: "Winecoff Hotel Fire", publisher: "Atlanta History Center", url: "https://www.atlantahistorycenter.com/" },
      { title: "Hotel fire safety", publisher: "National Fire Protection Association", url: "https://www.nfpa.org/" },
      { title: "Winecoff fire", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Atlanta disasters", publisher: "Georgia Historical Society", url: "https://georgiahistory.com/" },
      { title: "Winecoff Hotel", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Winecoff Hotel fire Atlanta 1946"],
    { eventYear: 1946, historicalEra: "postwar-cold-war" }
  ),
  item(
    "tri-state-tornado-1925",
    "The Tri-State Tornado of 1925: The Longest Tracked Tornado Path in U.S. History",
    "One supercell carved a death path across Missouri, Illinois, and Indiana — still unmatched in tracked length.",
    "Weird America",
    "The storm’s track, town destruction, death toll estimates, and how modern meteorology remembers it.",
    ["Tri-State Tornado 1925", "longest tornado path", "1925 tornado Missouri Illinois"],
    [
      { title: "Tri-State Tornado", publisher: "National Weather Service", url: "https://www.weather.gov/" },
      { title: "Tornado history", publisher: "NOAA", url: "https://www.noaa.gov/" },
      { title: "1925 tornado", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Midwest disasters", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Tri-State Tornado", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Tri-State Tornado 1925"],
    { eventYear: 1925, historicalEra: "twenties-depression" }
  ),
  item(
    "collinwood-school-fire-1908",
    "The Collinwood School Fire: Nearly 200 Children Died in a Cleveland School",
    "In 1908, Lake View School in Collinwood burned during class — locked exits and panic trapped students.",
    "Weird America",
    "How the fire started, why exits failed, the death toll, and school-safety reforms that followed.",
    ["Collinwood school fire", "Lake View School fire 1908", "Collinwood Cleveland fire"],
    [
      { title: "Collinwood School Fire", publisher: "Cleveland Memory Project", url: "https://www.clevelandmemory.org/" },
      { title: "Ohio school disasters", publisher: "Ohio History Connection", url: "https://www.ohiohistory.org/" },
      { title: "School fire safety", publisher: "National Fire Protection Association", url: "https://www.nfpa.org/" },
      { title: "Collinwood fire", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "American school fires", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Collinwood school fire 1908"],
    { eventYear: 1908, historicalEra: "progressive-wwi" }
  ),
  item(
    "credit-mobilier-scandal",
    "The Credit Mobilier Scandal: Railroad Bribes That Reached Congress",
    "Union Pacific insiders used Credit Mobilier stock to buy political protection — until a newspaper exposed the scheme.",
    "Scandal",
    "How the construction company skimmed profits, which politicians were implicated, and what Congress did afterward.",
    ["Credit Mobilier scandal", "Credit Mobilier Grant", "Union Pacific bribery"],
    [
      { title: "Credit Mobilier Scandal", publisher: "U.S. Senate", url: "https://www.senate.gov/about/powers-procedures/investigations/credit-mobilier.htm" },
      { title: "Credit Mobilier", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Gilded Age corruption", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Union Pacific history", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Credit Mobilier", publisher: "House History, Art & Archives", url: "https://history.house.gov/" },
    ],
    ["Credit Mobilier scandal Congress"],
    { eventYear: 1872, historicalEra: "reconstruction-gilded-age" }
  ),
  item(
    "whiskey-ring-scandal",
    "The Whiskey Ring: Tax Fraud Inside Grant’s Treasury",
    "Distillers and revenue agents skimmed liquor taxes — and the conspiracy reached the White House’s inner circle.",
    "Scandal",
    "How the ring worked, Grant’s response, who was convicted, and what it meant for Reconstruction-era politics.",
    ["Whiskey Ring", "Whiskey Ring Grant", "Treasury tax fraud 1870s"],
    [
      { title: "Whiskey Ring", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Grant administration scandals", publisher: "Ulysses S. Grant Presidential Library", url: "https://www.usgrantlibrary.org/" },
      { title: "Revenue fraud", publisher: "U.S. Department of the Treasury", url: "https://home.treasury.gov/" },
      { title: "Whiskey Ring", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Gilded Age scandals", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Whiskey Ring scandal Grant"],
    { eventYear: 1875, historicalEra: "reconstruction-gilded-age" }
  ),
  item(
    "operation-pastorius-1942",
    "Operation Pastorius: Nazi Saboteurs Landed on U.S. Beaches",
    "In 1942, U-boats put German saboteurs ashore in New York and Florida — most were caught within days.",
    "Military",
    "The mission plan, how one saboteur turned himself in, the military tribunal, and what the FBI files show.",
    ["Operation Pastorius", "Nazi saboteurs 1942", "German saboteurs America"],
    [
      { title: "Nazi Saboteurs and George Dasch", publisher: "FBI", url: "https://www.fbi.gov/history/famous-cases/nazi-saboteurs-and-george-john-dasch" },
      { title: "Operation Pastorius", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Ex parte Quirin", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Coast Guard WWII", publisher: "U.S. Coast Guard Historian", url: "https://www.history.uscg.mil/" },
      { title: "Nazi saboteurs", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Operation Pastorius Nazi saboteurs 1942"],
    { eventYear: 1942, historicalEra: "world-war-ii" }
  ),
  item(
    "duquesne-spy-ring",
    "The Duquesne Spy Ring: The Largest Espionage Ring Convicted in U.S. History",
    "FBI counterintelligence rolled up a Nazi spy network in New York — thirty-three convictions in one case.",
    "Crime",
    "How William Sebold became a double agent, what the ring targeted, and how the FBI filmed the evidence.",
    ["Duquesne Spy Ring", "Duquesne FBI", "Nazi spies New York"],
    [
      { title: "Duquesne Spy Ring", publisher: "FBI", url: "https://www.fbi.gov/history/famous-cases/duquesne-spy-ring" },
      { title: "World War II espionage", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Counterintelligence", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Sebold case", publisher: "National WWII Museum", url: "https://www.nationalww2museum.org/" },
      { title: "Duquesne ring", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Duquesne Spy Ring FBI"],
    { eventYear: 1941, historicalEra: "world-war-ii" }
  ),
  item(
    "fu-go-balloon-bombs",
    "Fu-Go Balloon Bombs: Japan’s Balloons Reached the American Mainland",
    "Japan launched thousands of bomb-carrying balloons across the Pacific — one killed six people in Oregon.",
    "Military",
    "How the balloons worked, where they landed, the Oregon deaths, and wartime press secrecy.",
    ["Fu-Go balloon bombs", "Japanese balloon bombs Oregon", "WWII balloon bombs US"],
    [
      { title: "Japanese Balloon Bombs", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Fu-Go", publisher: "Atomic Heritage Foundation", url: "https://ahf.nuclearmuseum.org/" },
      { title: "Balloon bombs", publisher: "Oregon Encyclopedia", url: "https://www.oregonencyclopedia.org/" },
      { title: "WWII home front", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Japanese balloon bombs", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Japanese Fu-Go balloon bombs Oregon"],
    { eventYear: 1945, historicalEra: "world-war-ii" }
  ),
  item(
    "kingsland-explosion-1917",
    "The Kingsland Explosion: A New Jersey Munitions Plant Fire Tied to Sabotage",
    "In 1917, shells cooked off for hours at a Kingsland munitions plant — investigators blamed German agents.",
    "Military",
    "What burned, the sabotage theory, Black Tom connections, and how the case entered U.S.–German claims.",
    ["Kingsland explosion 1917", "Kingsland munitions fire", "WWI sabotage New Jersey"],
    [
      { title: "Kingsland Explosion", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "German sabotage WWI", publisher: "National Park Service", url: "https://www.nps.gov/articles/black-tom.htm" },
      { title: "Munitions plants", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "New Jersey WWI", publisher: "New Jersey Historical Society", url: "https://jerseyhistory.org/" },
      { title: "Black Tom and Kingsland", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Kingsland explosion 1917 New Jersey"],
    { eventYear: 1917, historicalEra: "progressive-wwi" }
  ),
  item(
    "scopes-trial-1925",
    "The Scopes Trial: What Actually Happened in Dayton Beyond the Myth",
    "The 1925 “monkey trial” was courtroom theatre, a publicity stunt, and a real fight over teaching evolution.",
    "Politics",
    "Why Dayton hosted the case, what the law said, Bryan vs. Darrow, and how Hollywood reshaped memory.",
    ["Scopes Trial", "Scopes monkey trial", "Dayton Tennessee evolution"],
    [
      { title: "Scopes Trial", publisher: "Tennessee State Library and Archives", url: "https://sos.tn.gov/tsla" },
      { title: "Scopes Trial", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Evolution and education", publisher: "Smithsonian National Museum of Natural History", url: "https://naturalhistory.si.edu/" },
      { title: "Bryan and Darrow", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Scopes Trial", publisher: "American Experience / PBS", url: "https://www.pbs.org/wgbh/americanexperience/" },
    ],
    ["Scopes Trial Dayton 1925"],
    { eventYear: 1925, historicalEra: "twenties-depression" }
  ),
  item(
    "loving-v-virginia-1967",
    "Loving v. Virginia: The Couple Who Beat Anti-Miscegenation Law",
    "Richard and Mildred Loving’s fight against Virginia’s marriage ban reached the Supreme Court in 1967.",
    "Politics",
    "Their arrest, exile deal, legal strategy, and what the unanimous ruling changed.",
    ["Loving v Virginia", "Loving decision 1967", "interracial marriage Supreme Court"],
    [
      { title: "Loving v. Virginia", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Loving decision", publisher: "U.S. Supreme Court", url: "https://www.supremecourt.gov/" },
      { title: "Civil rights marriage cases", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Loving story", publisher: "Smithsonian National Museum of African American History", url: "https://nmaahc.si.edu/" },
      { title: "Loving v. Virginia", publisher: "Oyez", url: "https://www.oyez.org/cases/1966/395" },
    ],
    ["Loving v Virginia 1967"],
    { eventYear: 1967, historicalEra: "postwar-cold-war" }
  ),
  item(
    "abscam-1980",
    "ABSCAM: The FBI Sting That Caught Members of Congress on Camera",
    "Undercover agents posing as Arab sheikhs filmed politicians taking bribes — and Congress reeled.",
    "Scandal",
    "How the sting worked, who was convicted, civil-liberties criticism, and what the tapes showed.",
    ["ABSCAM", "ABSCAM FBI", "Congress bribery sting"],
    [
      { title: "ABSCAM", publisher: "FBI", url: "https://www.fbi.gov/history/famous-cases/abscam" },
      { title: "ABSCAM prosecutions", publisher: "Department of Justice", url: "https://www.justice.gov/" },
      { title: "Congressional ethics", publisher: "U.S. Senate", url: "https://www.senate.gov/" },
      { title: "ABSCAM", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "FBI undercover operations", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["ABSCAM FBI sting Congress"],
    { eventYear: 1980, historicalEra: "postwar-cold-war" }
  ),
  item(
    "quiz-show-scandals-1950s",
    "The Quiz Show Scandals: When Primetime Contests Were Rigged",
    "Fixed answers on Twenty-One and other shows shattered TV’s early credibility — and led to congressional hearings.",
    "Scandal",
    "How producers coached contestants, the Charles Van Doren case, and what Congress forced networks to change.",
    ["Quiz show scandal", "Twenty-One scandal", "Charles Van Doren"],
    [
      { title: "Quiz Show Scandals", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Television hearings", publisher: "U.S. House History", url: "https://history.house.gov/" },
      { title: "Broadcast regulation", publisher: "FCC historical materials", url: "https://www.fcc.gov/" },
      { title: "Quiz shows", publisher: "Paley Center for Media", url: "https://www.paleycenter.org/" },
      { title: "Van Doren scandal", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Quiz show scandal Twenty-One 1950s"],
    { eventYear: 1958, historicalEra: "postwar-cold-war" }
  ),
  item(
    "st-valentines-day-massacre-1929",
    "The St. Valentine’s Day Massacre: Capone-Era Murder in a Chicago Garage",
    "Seven men were lined up and machine-gunned on February 14, 1929 — a crime that defined Prohibition violence.",
    "Crime",
    "Who was killed, why Capone was suspected, the police response, and what evidence never stuck.",
    ["St Valentine's Day Massacre", "Capone garage shooting", "1929 Chicago massacre"],
    [
      { title: "St. Valentine's Day Massacre", publisher: "Chicago History Museum", url: "https://www.chicagohistory.org/" },
      { title: "Prohibition crime", publisher: "FBI", url: "https://www.fbi.gov/history" },
      { title: "Capone era", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Chicago crime", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Valentine's Day Massacre", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["St Valentines Day Massacre 1929 Chicago"],
    { eventYear: 1929, historicalEra: "twenties-depression" }
  ),
  item(
    "brinks-robbery-1950",
    "The Brinks Robbery: The Nearly Perfect Heist That Unraveled Years Later",
    "In 1950, thieves took more than a million dollars from a Boston Brinks vault — then mistakes caught up with them.",
    "Crime",
    "The planning, the take, the years of silence, and how the FBI finally broke the case.",
    ["Brinks robbery Boston", "Brinks heist 1950", "Great Brinks Robbery"],
    [
      { title: "Brinks Robbery", publisher: "FBI", url: "https://www.fbi.gov/history/famous-cases/brinks-robbery" },
      { title: "Boston crime history", publisher: "Boston Public Library", url: "https://www.bpl.org/" },
      { title: "Brinks case", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Famous heists", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Brinks robbery", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Brinks robbery Boston 1950"],
    { eventYear: 1950, historicalEra: "postwar-cold-war" }
  ),
  item(
    "willowbrook-hepatitis-studies",
    "The Willowbrook Hepatitis Studies: Children Used in Medical Research",
    "At Staten Island’s Willowbrook State School, researchers deliberately exposed children to hepatitis — and called it science.",
    "Scandal",
    "What the studies did, how consent failed, public exposure, and the ethics rules that followed.",
    ["Willowbrook hepatitis", "Willowbrook State School", "hepatitis experiments children"],
    [
      { title: "Willowbrook State School", publisher: "New York State Archives", url: "https://www.archives.nysed.gov/" },
      { title: "Human subjects research", publisher: "NIH / OHRP", url: "https://www.hhs.gov/ohrp/" },
      { title: "Willowbrook", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Medical ethics history", publisher: "National Library of Medicine", url: "https://www.nlm.nih.gov/" },
      { title: "Willowbrook expose", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Willowbrook hepatitis studies"],
    { eventYear: 1965, historicalEra: "postwar-cold-war" }
  ),
  item(
    "great-alaska-earthquake-1964",
    "The Great Alaska Earthquake of 1964: Quake, Tsunami, and Towns Washed Away",
    "The strongest quake in U.S. history triggered tsunamis that erased coastal towns from Alaska to California.",
    "Weird America",
    "Magnitude and rupture, tsunami deaths, Valdez and Chenega, and how USGS/NOAA documented the event.",
    ["1964 Alaska earthquake", "Good Friday earthquake", "Alaska tsunami 1964"],
    [
      { title: "The Great Alaska Earthquake of 1964", publisher: "USGS", url: "https://www.usgs.gov/programs/earthquake-hazards" },
      { title: "1964 tsunami", publisher: "NOAA", url: "https://www.noaa.gov/" },
      { title: "Alaska earthquake", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Good Friday Earthquake", publisher: "Alaska State Library", url: "https://library.alaska.gov/" },
      { title: "1964 Alaska quake", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Great Alaska Earthquake 1964"],
    { eventYear: 1964, historicalEra: "postwar-cold-war" }
  ),
  item(
    "rhythm-club-fire-1940",
    "The Rhythm Club Fire: A Jim Crow Dance Hall Became a Trap",
    "In Natchez in 1940, a packed dance hall fire killed about 200 people — mostly Black patrons blocked by barred windows.",
    "Weird America",
    "Why exits failed, segregation-era venue design, the death toll, and how memorials preserved the story.",
    ["Rhythm Club fire", "Natchez Rhythm Club fire 1940", "Natchez dance hall fire"],
    [
      { title: "Rhythm Club Fire", publisher: "Mississippi Department of Archives and History", url: "https://www.mdah.ms.gov/" },
      { title: "Natchez fire", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Fire disasters", publisher: "National Fire Protection Association", url: "https://www.nfpa.org/" },
      { title: "Jim Crow era disasters", publisher: "National Museum of African American History", url: "https://nmaahc.si.edu/" },
      { title: "Rhythm Club", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Rhythm Club fire Natchez 1940"],
    { eventYear: 1940, historicalEra: "world-war-ii" }
  ),
  item(
    "keating-five",
    "The Keating Five: Senators, a Thrift Collapse, and Soft Corruption",
    "Five U.S. senators intervened for Charles Keating’s failing S&L — and ethics investigators called it a national scandal.",
    "Scandal",
    "What Lincoln Savings did, how the meetings worked, the Senate ethics report, and the savings-and-loan crisis context.",
    ["Keating Five", "Keating Five scandal", "Lincoln Savings Charles Keating"],
    [
      { title: "Keating Five", publisher: "U.S. Senate Ethics", url: "https://www.ethics.senate.gov/" },
      { title: "Savings and Loan Crisis", publisher: "FDIC", url: "https://www.fdic.gov/history/" },
      { title: "Lincoln Savings", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "S&L crisis", publisher: "Federal Reserve History", url: "https://www.federalreservehistory.org/" },
      { title: "Keating Five", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Keating Five Lincoln Savings"],
    { eventYear: 1989, historicalEra: "postwar-cold-war" }
  ),
  item(
    "leopold-loeb-1924",
    "Leopold and Loeb: The “Perfect Crime” Murder That Gripped 1920s America",
    "Two wealthy Chicago students kidnapped and killed a boy to prove they could commit the perfect crime.",
    "Crime",
    "The murder plan, the glasses clue, Darrow’s defense, and why the case obsessed the Jazz Age press.",
    ["Leopold and Loeb", "Leopold Loeb trial", "perfect crime Chicago 1924"],
    [
      { title: "Leopold and Loeb", publisher: "Chicago History Museum", url: "https://www.chicagohistory.org/" },
      { title: "Crime of the century", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Clarence Darrow", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "1920s crime", publisher: "FBI history", url: "https://www.fbi.gov/history" },
      { title: "Leopold Loeb", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Leopold and Loeb trial 1924"],
    { eventYear: 1924, historicalEra: "twenties-depression" }
  ),
  item(
    "massie-affair-1932",
    "The Massie Affair: Race, Revenge, and a Famous Defense in Territorial Hawaii",
    "After a Navy wife alleged assault in Honolulu, a kidnapping and killing ignited a racial and political crisis.",
    "Crime",
    "The Ala Moana case, the murder of Joseph Kahahawai, Clarence Darrow’s defense, and territorial politics.",
    ["Massie Affair", "Massie case Hawaii", "Kahahawai murder"],
    [
      { title: "Massie Affair", publisher: "Hawaii State Archives", url: "https://ags.hawaii.gov/archives/" },
      { title: "Territorial Hawaii", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Massie case", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Navy and Hawaii", publisher: "Naval History and Heritage Command", url: "https://www.history.navy.mil/" },
      { title: "Massie Affair", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Massie Affair Hawaii 1932"],
    { eventYear: 1932, historicalEra: "twenties-depression" }
  ),
  item(
    "des-drug-tragedy",
    "DES: The Prenatal Drug Later Linked to Cancers in Daughters",
    "Doctors prescribed DES to prevent miscarriage — decades later, daughters developed rare cancers tied to the drug.",
    "Weird America",
    "Why DES was prescribed, the clear-cell adenocarcinoma link, FDA response, and litigation aftermath.",
    ["DES daughters", "diethylstilbestrol history", "DES cancer"],
    [
      { title: "Diethylstilbestrol (DES)", publisher: "CDC", url: "https://www.cdc.gov/des/" },
      { title: "DES drug history", publisher: "FDA", url: "https://www.fda.gov/" },
      { title: "DES research", publisher: "National Cancer Institute", url: "https://www.cancer.gov/" },
      { title: "DES research records", publisher: "National Library of Medicine", url: "https://www.nlm.nih.gov/" },
      { title: "DES public health history", publisher: "NIH", url: "https://www.nih.gov/" },
    ],
    ["DES diethylstilbestrol daughters"],
    { eventYear: 1971, historicalEra: "postwar-cold-war" }
  ),
  item(
    "dalkon-shield-scandal",
    "The Dalkon Shield: An IUD, Injuries, and a Corporate Liability Fight",
    "A popular IUD left a trail of infections and lawsuits — becoming a landmark product-liability scandal.",
    "Scandal",
    "Design flaws alleged in court, FDA action, bankruptcy strategy, and what victims documented.",
    ["Dalkon Shield", "Dalkon Shield lawsuit", "IUD scandal A.H. Robins"],
    [
      { title: "Dalkon Shield", publisher: "FDA historical materials", url: "https://www.fda.gov/" },
      { title: "Medical device liability", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Dalkon Shield cases", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Women's health history", publisher: "National Library of Medicine", url: "https://www.nlm.nih.gov/" },
      { title: "IUD controversies", publisher: "CDC", url: "https://www.cdc.gov/" },
    ],
    ["Dalkon Shield IUD scandal"],
    { eventYear: 1974, historicalEra: "postwar-cold-war" }
  ),
  item(
    "rosenberg-trial-1951",
    "The Rosenberg Trial: Espionage Convictions That Still Divide Historians",
    "Julius and Ethel Rosenberg were executed for atomic espionage — a case still argued over evidence and justice.",
    "Scandal",
    "What the government proved, Venona context, the trial atmosphere, and why debates persist.",
    ["Rosenberg trial", "Julius Ethel Rosenberg", "atomic espionage trial"],
    [
      { title: "Rosenberg case", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Venona", publisher: "National Security Agency", url: "https://www.nsa.gov/" },
      { title: "Rosenberg trial", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Cold War espionage", publisher: "FBI", url: "https://www.fbi.gov/history" },
      { title: "Rosenbergs", publisher: "Atomic Heritage Foundation", url: "https://ahf.nuclearmuseum.org/" },
    ],
    ["Rosenberg trial espionage 1951"],
    { eventYear: 1951, historicalEra: "postwar-cold-war" }
  )
);
