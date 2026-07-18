/** Second curated batch — SEO-friendly hard-to-believe U.S. history topics with fixed sources. */

function item(
  id,
  title,
  hook,
  category,
  angle,
  keywords,
  requiredSources,
  imageSearchTerms
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
  };
}

export const QUEUE_BATCH_2 = [
  item(
    "donora-smog-1948",
    "The Donora Smog of 1948: When Industrial Fog Killed 20 Americans in Five Days",
    "A mill town in Pennsylvania vanished into yellow smog — and the disaster helped launch the modern Clean Air Act.",
    "Weird America",
    "Temperature inversion, zinc-works emissions, the U.S. Public Health Service investigation, and how Donora changed national air-pollution policy.",
    ["Donora smog 1948", "Donora Pennsylvania air pollution", "Clean Air Act origins", "industrial smog disaster"],
    [
      { title: "A Darkness in Donora", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/a-darkness-in-donora-174128118/" },
      { title: "Donora Smog Museum", publisher: "Donora Historical Society", url: "https://www.donorasmog.com/" },
      { title: "Air Pollution History", publisher: "U.S. Environmental Protection Agency", url: "https://www.epa.gov/clean-air-act-overview/evolution-clean-air-act" },
      { title: "Public Health Service air pollution work", publisher: "CDC / NIOSH", url: "https://www.cdc.gov/niosh/" },
      { title: "Pennsylvania air quality history", publisher: "Pennsylvania DEP", url: "https://www.dep.pa.gov/" },
    ],
    ["Donora Pennsylvania 1948 smog industrial fog"]
  ),
  item(
    "galveston-hurricane-1900",
    "The Great Galveston Hurricane of 1900: America’s Deadliest Natural Disaster",
    "A Category 4 storm erased a booming Texas city — and killed more Americans than any hurricane before or since.",
    "Weird America",
    "The September 8 landfall, the seawall that came after, and why forecasting and coastal defenses changed forever.",
    ["Galveston hurricane 1900", "deadliest US hurricane", "Galveston seawall", "1900 Texas storm"],
    [
      { title: "Galveston Hurricane of 1900", publisher: "National Weather Service", url: "https://www.weather.gov/hgx/hurricanes_history" },
      { title: "The 1900 Storm", publisher: "NOAA", url: "https://www.noaa.gov/" },
      { title: "Galveston Hurricane", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "1900 Galveston hurricane", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/september-08/" },
      { title: "Galveston Island history", publisher: "Texas State Historical Association", url: "https://www.tshaonline.org/handbook/entries/galveston-hurricane-of-1900" },
    ],
    ["Galveston hurricane 1900 Texas storm damage"]
  ),
  item(
    "three-mile-island-1979",
    "Three Mile Island: The Partial Meltdown That Terrified America in 1979",
    "A stuck valve and confused operators turned a Pennsylvania nuclear plant into a national panic — and stalled U.S. nuclear power for decades.",
    "Military",
    "What actually melted, what the public was told, the Kemeny Commission findings, and how NRC rules changed afterward.",
    ["Three Mile Island 1979", "nuclear accident Pennsylvania", "TMI meltdown", "nuclear power accident US"],
    [
      { title: "Backgrounder on Three Mile Island", publisher: "U.S. Nuclear Regulatory Commission", url: "https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle.html" },
      { title: "Three Mile Island Accident", publisher: "NRC History", url: "https://www.nrc.gov/about-nrc/history.html" },
      { title: "Three Mile Island", publisher: "Smithsonian National Museum of American History", url: "https://americanhistory.si.edu/" },
      { title: "Nuclear energy crisis", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Three Mile Island", publisher: "PBS American Experience", url: "https://www.pbs.org/wgbh/americanexperience/features/three-mile-island-accident/" },
    ],
    ["Three Mile Island 1979 nuclear plant Pennsylvania"]
  ),
  item(
    "challenger-disaster-1986",
    "The Challenger Disaster: Why NASA Launched Despite Ice and Warnings",
    "Seventy-three seconds after liftoff, the shuttle broke apart on live television — and the investigation exposed ignored O-ring warnings.",
    "Military",
    "The January 28 launch decision, Rogers Commission findings, and how engineer concerns were overruled in cold weather.",
    ["Challenger disaster 1986", "NASA Challenger explosion", "O-ring failure", "Christa McAuliffe"],
    [
      { title: "Challenger STS-51-L", publisher: "NASA", url: "https://www.nasa.gov/mission/sts-51l/" },
      { title: "Rogers Commission Report", publisher: "NASA History", url: "https://history.nasa.gov/rogersrep/genindex.htm" },
      { title: "Space Shuttle Challenger", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Challenger accident", publisher: "Smithsonian National Air and Space Museum", url: "https://airandspace.si.edu/" },
      { title: "Today in History — January 28", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/january-28/" },
    ],
    ["Challenger space shuttle disaster 1986 NASA"]
  ),
  item(
    "apollo-1-fire-1967",
    "Apollo 1: The Capsule Fire That Almost Ended the Moon Program",
    "Three astronauts died on the launch pad in a pure-oxygen cabin — and NASA redesigns began before anyone walked on the Moon.",
    "Military",
    "The January 27, 1967 pad fire, the blocked hatch, and the safety overhaul that made Apollo 11 possible.",
    ["Apollo 1 fire", "Apollo 1 disaster 1967", "Gus Grissom", "NASA capsule fire"],
    [
      { title: "Apollo 1", publisher: "NASA", url: "https://www.nasa.gov/mission_pages/apollo/missions/apollo1.html" },
      { title: "Apollo 1 Investigation", publisher: "NASA History", url: "https://history.nasa.gov/Apollo204/" },
      { title: "Apollo program", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Apollo 1", publisher: "Smithsonian National Air and Space Museum", url: "https://airandspace.si.edu/" },
      { title: "Space race chronology", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Apollo 1 fire 1967 NASA capsule"]
  ),
  item(
    "hyatt-regency-walkway-collapse-1981",
    "The Hyatt Regency Walkway Collapse: A Design Change That Killed 114",
    "Two skywalks fell into a hotel lobby during a tea dance — and the investigation traced the disaster to a fatal structural redesign.",
    "Weird America",
    "How a hanger-rod change doubled the load, why inspections missed it, and how engineering ethics codes changed afterward.",
    ["Hyatt Regency walkway collapse", "1981 Kansas City hotel disaster", "skywalk collapse", "engineering ethics"],
    [
      { title: "Hyatt Regency Walkway Collapse", publisher: "NIST", url: "https://www.nist.gov/" },
      { title: "Kansas City Hyatt disaster", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Structural failure case study", publisher: "American Society of Civil Engineers", url: "https://www.asce.org/" },
      { title: "Engineering ethics", publisher: "National Academy of Engineering", url: "https://www.nae.edu/" },
      { title: "1981 disasters", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Hyatt Regency Kansas City walkway collapse 1981"]
  ),
  item(
    "silver-bridge-collapse-1967",
    "The Silver Bridge Collapse: When a Tiny Eye-Bar Crack Dropped 46 People into the Ohio River",
    "Rush-hour traffic plunged into freezing water — and a microscopic metal flaw in a 40-year-old bridge was enough.",
    "Weird America",
    "Point Pleasant, West Virginia; eye-bar fracture; and how the disaster created modern U.S. bridge inspection rules.",
    ["Silver Bridge collapse 1967", "Point Pleasant bridge disaster", "Ohio River bridge collapse", "bridge inspection history"],
    [
      { title: "Silver Bridge Collapse", publisher: "National Transportation Safety Board", url: "https://www.ntsb.gov/" },
      { title: "Bridge inspection history", publisher: "Federal Highway Administration", url: "https://www.fhwa.dot.gov/" },
      { title: "Point Pleasant disaster", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Ohio River history", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "West Virginia disasters", publisher: "West Virginia Archives and History", url: "https://wvculture.org/history/" },
    ],
    ["Silver Bridge collapse 1967 Point Pleasant"]
  ),
  item(
    "texas-city-disaster-1947",
    "The Texas City Disaster of 1947: When a Freighter of Ammonium Nitrate Leveled a Port",
    "A shipboard fire became one of the largest non-nuclear explosions in U.S. history — killing hundreds and shattering windows miles away.",
    "Weird America",
    "The Grandcamp fire, cascading plant explosions, and how hazardous-cargo rules changed after Texas City.",
    ["Texas City disaster 1947", "ammonium nitrate explosion Texas", "SS Grandcamp", "Texas City explosion"],
    [
      { title: "Texas City Disaster", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Texas City explosion", publisher: "U.S. Coast Guard history", url: "https://www.history.uscg.mil/" },
      { title: "Ammonium nitrate hazards", publisher: "U.S. Chemical Safety Board", url: "https://www.csb.gov/" },
      { title: "Texas City 1947", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Texas City Disaster", publisher: "Texas State Historical Association", url: "https://www.tshaonline.org/handbook/entries/texas-city-disaster" },
    ],
    ["Texas City disaster 1947 ammonium nitrate explosion"]
  ),
  item(
    "iroquois-theatre-fire-1903",
    "The Iroquois Theatre Fire: America’s Deadliest Single-Building Fire",
    "A matinee in Chicago turned into a death trap when exits failed — more than 600 people never made it out.",
    "Weird America",
    "Blocked exits, asbestos curtains that failed, and how building and theater codes were rewritten after the 1903 fire.",
    ["Iroquois Theatre fire", "Iroquois Theatre fire 1903", "deadliest theater fire US", "Chicago theater fire"],
    [
      { title: "Iroquois Theater Fire", publisher: "Chicago History Museum", url: "https://www.chicagohistory.org/" },
      { title: "Theater fire safety history", publisher: "National Fire Protection Association", url: "https://www.nfpa.org/" },
      { title: "Chicago disasters", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Building codes history", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Iroquois Theatre Fire", publisher: "Encyclopedia of Chicago", url: "https://www.encyclopedia.chicagohistory.org/pages/632.html" },
    ],
    ["Iroquois Theatre fire 1903 Chicago"]
  ),
  item(
    "our-lady-of-the-angels-fire-1958",
    "Our Lady of the Angels: The Chicago School Fire That Changed Building Codes",
    "Ninety-two children and three nuns died in a school that met the codes of its day — until the codes changed forever.",
    "Weird America",
    "How the 1958 fire exposed inadequate school fire protection and drove nationwide school safety reforms.",
    ["Our Lady of the Angels fire", "1958 Chicago school fire", "school fire safety US", "OLTA fire"],
    [
      { title: "Our Lady of the Angels School Fire", publisher: "National Fire Protection Association", url: "https://www.nfpa.org/" },
      { title: "Chicago school fire 1958", publisher: "Chicago History Museum", url: "https://www.chicagohistory.org/" },
      { title: "School fire safety", publisher: "U.S. Fire Administration", url: "https://www.usfa.fema.gov/" },
      { title: "1958 disasters", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Fire investigation history", publisher: "National Archives", url: "https://www.archives.gov/" },
    ],
    ["Our Lady of the Angels school fire 1958 Chicago"]
  ),
  item(
    "buffalo-creek-flood-1972",
    "The Buffalo Creek Flood: When a Coal-Waste Dam Erased 16 West Virginia Towns",
    "A slurry impoundment failed after rain — and a black wall of water killed 125 people in minutes.",
    "Weird America",
    "Pittston Coal’s dams, the 1972 failure, survivor testimony, and how mine-waste regulation tightened afterward.",
    ["Buffalo Creek flood 1972", "West Virginia coal dam disaster", "slurry dam failure", "Buffalo Creek disaster"],
    [
      { title: "Buffalo Creek Flood", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Mine Safety and Health", publisher: "MSHA", url: "https://www.msha.gov/" },
      { title: "Buffalo Creek", publisher: "West Virginia Archives and History", url: "https://wvculture.org/history/" },
      { title: "Coal mining disasters", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Buffalo Creek Flood", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Buffalo Creek flood 1972 West Virginia coal"]
  ),
  item(
    "cutter-polio-vaccine-incident-1955",
    "The Cutter Incident: When a Polio Vaccine Paralyzed Children It Was Meant to Protect",
    "Weeks after the Salk vaccine’s triumph, one manufacturer’s bad batches infected children — and nearly killed the vaccination campaign.",
    "Weird America",
    "Live virus in Cutter Laboratories doses, the federal recall, and how vaccine safety oversight changed in 1955.",
    ["Cutter Incident 1955", "polio vaccine disaster", "Salk vaccine Cutter", "polio vaccine paralysis"],
    [
      { title: "Polio vaccine history", publisher: "CDC", url: "https://www.cdc.gov/polio/" },
      { title: "Vaccine safety history", publisher: "FDA", url: "https://www.fda.gov/" },
      { title: "Polio crusade", publisher: "PBS American Experience", url: "https://www.pbs.org/wgbh/americanexperience/films/polio/" },
      { title: "Public health archives", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Polio history", publisher: "Smithsonian National Museum of American History", url: "https://americanhistory.si.edu/" },
    ],
    ["Cutter polio vaccine incident 1955"]
  ),
  item(
    "childrens-blizzard-1888",
    "The Children’s Blizzard of 1888: When a Sudden Storm Killed Schoolchildren on the Prairie",
    "A warm January morning turned lethal by afternoon — children walking home never made it through the whiteout.",
    "Weird America",
    "The January 12 storm across the Plains, schoolhouse tragedies, and why weather forecasting mattered on the frontier.",
    ["Children's Blizzard 1888", "Schoolchildren's Blizzard", "1888 prairie blizzard", "January 12 1888 storm"],
    [
      { title: "The Children's Blizzard", publisher: "National Weather Service", url: "https://www.weather.gov/" },
      { title: "Great Plains weather history", publisher: "NOAA", url: "https://www.noaa.gov/" },
      { title: "1888 blizzard", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Prairie settlement", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Minnesota weather history", publisher: "Minnesota Historical Society", url: "https://www.mnhs.org/" },
    ],
    ["Children's Blizzard 1888 prairie school"]
  ),
  item(
    "zoot-suit-riots-1943",
    "The Zoot Suit Riots: When Sailors Attacked Mexican American Youths in Wartime Los Angeles",
    "For days in 1943, servicemen hunted teens in flashy suits — while local papers cheered and police looked away.",
    "Politics",
    "Wartime racism, the Sleepy Lagoon case backdrop, and how the riots exposed Los Angeles justice for Mexican Americans.",
    ["Zoot Suit Riots", "Zoot Suit Riots 1943", "Los Angeles 1943 riots", "Mexican American history WWII"],
    [
      { title: "Zoot Suit Riots", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "WWII home front", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Zoot Suit Riots", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
      { title: "Los Angeles history", publisher: "Los Angeles Public Library", url: "https://www.lapl.org/" },
      { title: "Civil rights timeline", publisher: "National Park Service", url: "https://www.nps.gov/" },
    ],
    ["Zoot Suit Riots 1943 Los Angeles"]
  ),
  item(
    "gulf-of-tonkin-1964",
    "The Gulf of Tonkin Incident: The Murky Night That Escalated Vietnam",
    "Congress nearly unanimously authorized war after reported attacks — including one that almost certainly never happened.",
    "Military",
    "The Maddox encounters, NSA intercept controversies, and how the Gulf of Tonkin Resolution unlocked the Vietnam escalation.",
    ["Gulf of Tonkin incident", "Gulf of Tonkin Resolution", "1964 Vietnam escalation", "USS Maddox"],
    [
      { title: "Gulf of Tonkin", publisher: "U.S. Naval History and Heritage Command", url: "https://www.history.navy.mil/" },
      { title: "Tonkin Gulf Resolution", publisher: "National Archives", url: "https://www.archives.gov/milestone-documents/tonkin-gulf-resolution" },
      { title: "Vietnam War", publisher: "U.S. Army Center of Military History", url: "https://history.army.mil/" },
      { title: "NSA and Tonkin", publisher: "National Security Agency", url: "https://www.nsa.gov/" },
      { title: "Vietnam chronology", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Gulf of Tonkin 1964 USS Maddox"]
  ),
  item(
    "operation-ajax-1953",
    "Operation Ajax: How the CIA Helped Overthrow Iran’s Prime Minister in 1953",
    "A covert U.S.–British plot toppled Mohammad Mossadegh — and reshaped Middle East politics for generations.",
    "Politics",
    "Oil nationalization, CIA cables, street protests, and the coup’s long shadow after the Cold War.",
    ["Operation Ajax", "1953 Iran coup", "CIA Mossadegh", "Iran coup 1953"],
    [
      { title: "The 1953 Coup in Iran", publisher: "National Security Archive", url: "https://nsarchive.gwu.edu/briefing-book/iran/2017-10-04/iran-1953-coup-65th-anniversaries" },
      { title: "CIA historical collections", publisher: "CIA FOIA", url: "https://www.cia.gov/readingroom/" },
      { title: "Cold War foreign policy", publisher: "U.S. State Department Office of the Historian", url: "https://history.state.gov/" },
      { title: "Iran 1953", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Cold War documents", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Operation Ajax 1953 Iran CIA coup"]
  ),
  item(
    "project-mkultra",
    "Project MKUltra: The CIA’s Secret Mind-Control Experiments on Americans",
    "LSD, hypnosis, and unwitting subjects — a Cold War program so extreme Congress later held public hearings.",
    "Politics",
    "What the Church Committee and CIA documents revealed about MKUltra’s scope, destruction of files, and human subjects.",
    ["Project MKUltra", "CIA MKUltra experiments", "CIA LSD experiments", "mind control CIA"],
    [
      { title: "MKUltra Collection", publisher: "CIA FOIA Reading Room", url: "https://www.cia.gov/readingroom/collection/mkultra" },
      { title: "Church Committee reports", publisher: "U.S. Senate", url: "https://www.senate.gov/about/powers-procedures/investigations/church-committee.htm" },
      { title: "Intelligence abuses", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Cold War secrecy", publisher: "National Security Archive", url: "https://nsarchive.gwu.edu/" },
      { title: "Congressional investigations", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Project MKUltra CIA documents"]
  ),
  item(
    "little-rock-nine-1957",
    "The Little Rock Nine: When a President Sent the 101st Airborne to Integrate a High School",
    "Nine Black students tried to enter Central High — and faced a mob until federal troops escorted them to class.",
    "Politics",
    "Brown v. Board resistance in Arkansas, Eisenhower’s executive order, and the daily ordeal inside Central High.",
    ["Little Rock Nine", "Little Rock integration 1957", "Central High School crisis", "Eisenhower Little Rock"],
    [
      { title: "Little Rock Central High School", publisher: "National Park Service", url: "https://www.nps.gov/chsc/" },
      { title: "Executive Order 10730", publisher: "National Archives", url: "https://www.archives.gov/milestone-documents/executive-order-10730" },
      { title: "Civil Rights history", publisher: "Library of Congress", url: "https://www.loc.gov/collections/civil-rights-history-project/" },
      { title: "Desegregation", publisher: "Eisenhower Presidential Library", url: "https://www.eisenhowerlibrary.gov/" },
      { title: "Little Rock Nine", publisher: "Smithsonian National Museum of African American History", url: "https://nmaahc.si.edu/" },
    ],
    ["Little Rock Nine 1957 Central High"]
  ),
  item(
    "emmett-till-1955",
    "The Murder of Emmett Till: How an Open-Casket Funeral Shocked the Nation",
    "A 14-year-old from Chicago was killed in Mississippi — and his mother’s decision to show his face helped fuel the civil rights movement.",
    "Politics",
    "The Money, Mississippi killing, the acquittal, later confessions, and why Till’s death became a national turning point.",
    ["Emmett Till", "Emmett Till murder 1955", "Emmett Till open casket", "civil rights Emmett Till"],
    [
      { title: "Emmett Till", publisher: "National Museum of African American History and Culture", url: "https://nmaahc.si.edu/" },
      { title: "Civil Rights history", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Emmett Till", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Civil Rights timeline", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Till case records", publisher: "FBI", url: "https://www.fbi.gov/" },
    ],
    ["Emmett Till 1955 civil rights"]
  ),
  item(
    "salem-witch-trials-1692",
    "The Salem Witch Trials: How Spectral Evidence Condemned Neighbors to Death",
    "In 1692, accusations, visions, and courtroom panic led to hangings — and a colony later admitted it had been wrong.",
    "Weird America",
    "Spectral evidence, the Court of Oyer and Terminer, and how Massachusetts later reversed attainders and paid restitution.",
    ["Salem witch trials", "Salem witch trials 1692", "spectral evidence Salem", "Salem witch hunt history"],
    [
      { title: "Salem Witch Trials", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/march-01/" },
      { title: "Colonial records", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Salem Witch Museum / history", publisher: "National Park Service", url: "https://www.nps.gov/sama/" },
      { title: "Massachusetts historical records", publisher: "Massachusetts Archives", url: "https://www.sec.state.ma.us/arc/" },
      { title: "Witchcraft in colonial America", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/" },
    ],
    ["Salem witch trials 1692 Massachusetts"]
  ),
  item(
    "amistad-revolt-1839",
    "The Amistad: When Enslaved Africans Seized a Ship and Forced America into Court",
    "A mutiny at sea became a Supreme Court case — with John Quincy Adams arguing for the Africans’ freedom.",
    "Politics",
    "The 1839 revolt, Connecticut trials, and the Supreme Court decision that ordered the survivors released.",
    ["Amistad revolt", "Amistad Supreme Court", "Amistad 1839", "John Quincy Adams Amistad"],
    [
      { title: "United States v. The Amistad", publisher: "National Archives", url: "https://www.archives.gov/education/lessons/amistad" },
      { title: "Amistad", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Amistad case", publisher: "U.S. Supreme Court historical materials", url: "https://www.supremecourt.gov/" },
      { title: "Slavery and the courts", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Amistad", publisher: "Smithsonian National Museum of African American History", url: "https://nmaahc.si.edu/" },
    ],
    ["Amistad revolt 1839 Supreme Court"]
  ),
  item(
    "philadelphia-yellow-fever-1793",
    "Philadelphia’s 1793 Yellow Fever Epidemic: When the Capital City Emptied",
    "Thousands died in weeks; Washington’s government fled; and doctors fought over whether bleeding cured or killed.",
    "Weird America",
    "The 1793 outbreak, Free African Society volunteers, contested medical theories, and how the epidemic reshaped public health.",
    ["Philadelphia yellow fever 1793", "1793 yellow fever epidemic", "Benjamin Rush yellow fever", "capital epidemic"],
    [
      { title: "Yellow Fever Epidemic of 1793", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Philadelphia 1793", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Early American public health", publisher: "National Library of Medicine", url: "https://www.nlm.nih.gov/" },
      { title: "Yellow fever history", publisher: "CDC", url: "https://www.cdc.gov/yellow-fever/" },
      { title: "Capital city crisis", publisher: "National Park Service", url: "https://www.nps.gov/inde/" },
    ],
    ["Philadelphia yellow fever epidemic 1793"]
  ),
  item(
    "spanish-flu-1918-america",
    "The 1918 Flu in America: How a Pandemic Killed More U.S. Troops Than Combat in WWI",
    "Crowded camps and liberty-loan parades spread a virus that filled morgues — while wartime censors muted the headlines.",
    "Weird America",
    "Camp Funston origins debate, Philadelphia’s parade disaster, and why the second wave was deadlier than the first.",
    ["1918 flu pandemic America", "Spanish flu United States", "1918 influenza epidemic", "WWI flu deaths"],
    [
      { title: "1918 Pandemic Influenza", publisher: "CDC", url: "https://www.cdc.gov/flu/pandemic-resources/1918-commemoration/1918-pandemic-history.htm" },
      { title: "Influenza Encyclopedia", publisher: "University of Michigan / CDC partner materials", url: "https://www.influenzaarchive.org/" },
      { title: "WWI and influenza", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "1918 flu", publisher: "National Library of Medicine", url: "https://www.nlm.nih.gov/" },
      { title: "Pandemic history", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["1918 influenza pandemic United States"]
  ),
  item(
    "dust-bowl-1930s",
    "The Dust Bowl: When the Great Plains Turned to Black Blizzards",
    "Farmers watched topsoil blow to the Atlantic — and a man-made ecological disaster became a defining image of the Depression.",
    "Weird America",
    "Overplowing, drought, Black Sunday, New Deal conservation, and the Okie migration captured by government photographers.",
    ["Dust Bowl", "Dust Bowl 1930s", "Black Sunday dust storm", "Okies Dust Bowl migration"],
    [
      { title: "Dust Bowl", publisher: "Library of Congress", url: "https://www.loc.gov/collections/fsa-owi-black-and-white-negatives/" },
      { title: "Dust Bowl history", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Soil conservation history", publisher: "USDA NRCS", url: "https://www.nrcs.usda.gov/" },
      { title: "Drought and the Plains", publisher: "NOAA", url: "https://www.noaa.gov/" },
      { title: "Surviving the Dust Bowl", publisher: "PBS American Experience", url: "https://www.pbs.org/wgbh/americanexperience/films/dustbowl/" },
    ],
    ["Dust Bowl 1930s black blizzard Great Plains"]
  ),
  item(
    "libby-montana-asbestos",
    "Libby, Montana: The Asbestos Town the Government Called a Public Health Emergency",
    "Vermiculite mining coated a town in toxic dust — and decades later the EPA launched one of its largest cleanup efforts.",
    "Weird America",
    "W.R. Grace’s mine, asbestosis among residents, and how Libby became a Superfund cautionary tale.",
    ["Libby Montana asbestos", "Libby asbestos EPA", "vermiculite Libby", "W.R. Grace Libby"],
    [
      { title: "Libby Asbestos Site", publisher: "U.S. Environmental Protection Agency", url: "https://www.epa.gov/libby" },
      { title: "Asbestos health effects", publisher: "Agency for Toxic Substances and Disease Registry", url: "https://www.atsdr.cdc.gov/" },
      { title: "Public health emergency", publisher: "CDC", url: "https://www.cdc.gov/" },
      { title: "Environmental disasters", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Montana history", publisher: "Montana Historical Society", url: "https://mhs.mt.gov/" },
    ],
    ["Libby Montana asbestos vermiculite cleanup"]
  ),
  item(
    "iran-contra-affair",
    "Iran-Contra: Secret Arms Deals, Hostages, and a Covert War Congress Had Banned",
    "Officials sold arms to Iran and funneled profits to Nicaraguan rebels — then shredded documents when the story broke.",
    "Scandal",
    "The Boland Amendments, Oliver North’s enterprise, Tower Commission findings, and the limits of presidential covert power.",
    ["Iran-Contra affair", "Iran Contra scandal", "Oliver North Iran Contra", "Reagan Iran Contra"],
    [
      { title: "Iran-Contra Affair", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Tower Commission", publisher: "Ronald Reagan Presidential Library", url: "https://www.reaganlibrary.gov/" },
      { title: "Congressional investigations", publisher: "U.S. Senate", url: "https://www.senate.gov/" },
      { title: "Iran-Contra documents", publisher: "National Security Archive", url: "https://nsarchive.gwu.edu/" },
      { title: "1980s foreign policy", publisher: "U.S. State Department Office of the Historian", url: "https://history.state.gov/" },
    ],
    ["Iran Contra affair Reagan Oliver North"]
  ),
  item(
    "watergate-break-in-1972",
    "Watergate: From a ‘Third-Rate Burglary’ to a Presidential Resignation",
    "A bungled break-in at Democratic headquarters unraveled into wiretaps, hush money, and the only U.S. presidential resignation.",
    "Scandal",
    "The 1972 burglary, the cover-up, the tapes, and how investigative reporting and congressional hearings forced Nixon out.",
    ["Watergate scandal", "Watergate break-in 1972", "Nixon resignation", "Watergate tapes"],
    [
      { title: "Watergate", publisher: "National Archives", url: "https://www.archives.gov/education/lessons/watergate-constitution" },
      { title: "Nixon Presidential Materials", publisher: "Richard Nixon Presidential Library", url: "https://www.nixonlibrary.gov/" },
      { title: "Senate Watergate Committee", publisher: "U.S. Senate", url: "https://www.senate.gov/about/powers-procedures/investigations/watergate.htm" },
      { title: "Watergate", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Investigative reporting history", publisher: "Smithsonian National Museum of American History", url: "https://americanhistory.si.edu/" },
    ],
    ["Watergate 1972 Nixon resignation"]
  ),
];
