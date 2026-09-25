/**
 * Fourth curated batch — refill after the queue hit zero pending (Sep 2026).
 * Search-intent U.S. history topics with named https sources.
 */

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

export const QUEUE_BATCH_4 = [
  item(
    "white-house-burning-1814",
    "The Burning of the White House in 1814: Why the British Torched Washington",
    "British troops occupied Washington in August 1814 and set fire to the White House and the Capitol — then a storm helped stop the blaze.",
    "Military",
    "Why the British attacked Washington during the War of 1812, what burned, how Dolley Madison’s household escaped, and how the city rebuilt.",
    ["Burning of the White House 1814", "War of 1812 Washington", "British burn White House"],
    [
      { title: "The Burning of Washington", publisher: "National Park Service", url: "https://www.nps.gov/stsp/learn/historyculture/burning-of-washington.htm" },
      { title: "Today in History: August 24", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/august-24/" },
      { title: "War of 1812", publisher: "National Archives", url: "https://www.archives.gov/research/military/war-of-1812" },
      { title: "The White House is burned", publisher: "White House Historical Association", url: "https://www.whitehousehistory.org/the-burning-of-the-white-house" },
      { title: "Star-Spangled Banner and the War of 1812", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/the-story-behind-the-star-spangled-banner-149220970/" },
    ],
    ["Burning of Washington 1814 White House"]
  ),
  item(
    "louisiana-purchase-1803",
    "The Louisiana Purchase of 1803: How the United States Doubled Its Land",
    "Jefferson’s envoys went to Paris to buy New Orleans and came home with a land deal that redrew the map of North America.",
    "Politics",
    "Why Napoleon sold the territory, what the treaty actually transferred, the constitutional debate at home, and what the purchase meant for people already living there.",
    ["Louisiana Purchase 1803", "Louisiana Purchase treaty", "Thomas Jefferson land deal"],
    [
      { title: "Louisiana Purchase", publisher: "National Archives", url: "https://www.archives.gov/milestone-documents/louisiana-purchase-treaty" },
      { title: "Louisiana Purchase", publisher: "Library of Congress", url: "https://www.loc.gov/collections/louisiana-european-explorations-and-the-louisiana-purchase/articles-and-essays/the-louisiana-purchase/" },
      { title: "Lewis and Clark and the Louisiana Purchase", publisher: "National Park Service", url: "https://www.nps.gov/jeff/learn/historyculture/louisiana-purchase.htm" },
      { title: "Louisiana Purchase Treaty", publisher: "National Archives Catalog", url: "https://catalog.archives.gov/id/299804" },
      { title: "The Louisiana Purchase", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/how-the-louisiana-purchase-changed-the-world-79715124/" },
    ],
    ["Louisiana Purchase treaty 1803"]
  ),
  item(
    "lewis-and-clark-expedition",
    "Lewis and Clark: The Expedition That Mapped the Louisiana Territory",
    "From 1804 to 1806, the Corps of Discovery crossed the continent and sent back maps, specimens, and a record of nations the United States barely knew.",
    "Weird America",
    "Jefferson’s orders, the role of Sacagawea and York, what the journals actually recorded, and how the expedition is documented in federal collections.",
    ["Lewis and Clark expedition", "Corps of Discovery", "Sacagawea Lewis and Clark"],
    [
      { title: "Lewis and Clark Expedition", publisher: "National Park Service", url: "https://www.nps.gov/lecl/index.htm" },
      { title: "Lewis and Clark journals", publisher: "Library of Congress", url: "https://www.loc.gov/collections/lewis-and-clark-expedition/" },
      { title: "Corps of Discovery", publisher: "National Archives", url: "https://www.archives.gov/education/lessons/lewis-clark" },
      { title: "Lewis and Clark", publisher: "Jefferson National Expansion Memorial", url: "https://www.nps.gov/jeff/learn/historyculture/lewis-and-clark.htm" },
      { title: "Lewis and Clark Expedition", publisher: "Smithsonian Institution", url: "https://www.si.edu/spotlight/lewis-and-clark" },
    ],
    ["Lewis and Clark expedition journals"]
  ),
  item(
    "erie-canal-1825",
    "The Erie Canal of 1825: The Ditch That Connected the Great Lakes to the Atlantic",
    "New York dug a 363-mile canal by hand and turned a inland lake route into the country’s busiest commercial path.",
    "Weird America",
    "Why New York funded the canal, how locks and labor actually worked, the opening voyage, and how towns along the route changed.",
    ["Erie Canal 1825", "Erie Canal history", "Clinton’s Ditch"],
    [
      { title: "Erie Canal", publisher: "National Park Service", url: "https://www.nps.gov/erie/index.htm" },
      { title: "Erie Canal", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/october-26/" },
      { title: "Erie Canal records", publisher: "New York State Archives", url: "https://www.archives.nysed.gov/research/topic-erie-canal" },
      { title: "Erie Canalway", publisher: "Erie Canalway National Heritage Corridor", url: "https://eriecanalway.org/learn/history-culture" },
      { title: "The Erie Canal", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/brief-history-erie-canal-180976666/" },
    ],
    ["Erie Canal 1825 opening"]
  ),
  item(
    "california-gold-rush-1848",
    "The California Gold Rush: What Happened After Gold Was Found at Sutter’s Mill",
    "James Marshall’s discovery in 1848 pulled hundreds of thousands west and remade California in a few violent years.",
    "Weird America",
    "The Sutter’s Mill find, who actually profited, the impact on Native communities and newly arrived miners, and how statehood followed the rush.",
    ["California Gold Rush 1848", "Sutter's Mill", "Gold Rush California"],
    [
      { title: "California Gold Rush", publisher: "Library of Congress", url: "https://www.loc.gov/collections/california-first-person-narratives/articles-and-essays/early-california-history/from-gold-rush-to-statehood/" },
      { title: "Gold Rush", publisher: "National Park Service", url: "https://www.nps.gov/articles/california-gold-rush.htm" },
      { title: "Marshall Gold Discovery", publisher: "California State Parks", url: "https://www.parks.ca.gov/?page_id=484" },
      { title: "Gold Rush letters", publisher: "National Archives", url: "https://www.archives.gov/education/lessons/gold-rush" },
      { title: "California Gold Rush", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/the-forgotten-entrepreneurs-of-the-gold-rush-180983314/" },
    ],
    ["Sutter's Mill California Gold Rush"]
  ),
  item(
    "underground-railroad",
    "The Underground Railroad: How People Escaped Slavery in the United States",
    "It was not a single railroad. It was a loose network of routes, hiding places, and people who risked prison to move freedom seekers north.",
    "Politics",
    "What historians can document about routes and conductors, Harriet Tubman’s documented trips, the Fugitive Slave Act’s role, and what records actually survive.",
    ["Underground Railroad", "Harriet Tubman Underground Railroad", "Fugitive Slave Act"],
    [
      { title: "Underground Railroad", publisher: "National Park Service", url: "https://www.nps.gov/subjects/undergroundrailroad/index.htm" },
      { title: "Harriet Tubman", publisher: "National Park Service", url: "https://www.nps.gov/hatu/index.htm" },
      { title: "Underground Railroad", publisher: "Library of Congress", url: "https://www.loc.gov/classroom-materials/harriet-tubman/" },
      { title: "Fugitive Slave Act of 1850", publisher: "National Archives", url: "https://www.archives.gov/milestone-documents/compromise-of-1850" },
      { title: "Underground Railroad", publisher: "Smithsonian Institution", url: "https://nmaahc.si.edu/explore/stories/underground-railroad" },
    ],
    ["Harriet Tubman Underground Railroad"]
  ),
  item(
    "nineteenth-amendment-1920",
    "The 19th Amendment: How American Women Won the Right to Vote in 1920",
    "Decades of organizing ended with a one-vote ratification fight in Tennessee — and the amendment still did not guarantee the ballot for every woman.",
    "Politics",
    "The amendment’s text, the ratification fight, who was still barred from voting after 1920, and the documented organizers behind the campaign.",
    ["19th Amendment 1920", "women's suffrage United States", "Tennessee ratification 19th Amendment"],
    [
      { title: "19th Amendment", publisher: "National Archives", url: "https://www.archives.gov/milestone-documents/19th-amendment" },
      { title: "Women’s suffrage", publisher: "Library of Congress", url: "https://www.loc.gov/collections/women-of-protest/articles-and-essays/selected-leaders-of-the-national-womans-party/" },
      { title: "19th Amendment", publisher: "National Park Service", url: "https://www.nps.gov/articles/woman-suffrage-centennial.htm" },
      { title: "Suffrage history", publisher: "National Archives Catalog", url: "https://catalog.archives.gov/id/299821" },
      { title: "How women won the vote", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/how-women-got-the-vote-180974827/" },
    ],
    ["19th Amendment ratification 1920"]
  ),
  item(
    "brown-v-board-1954",
    "Brown v. Board of Education: The 1954 Ruling That Struck Down School Segregation",
    "The Supreme Court held that separate schools were not equal — then the country spent years fighting over what the decision actually changed.",
    "Politics",
    "The cases combined as Brown, what the 1954 opinion said, the 1955 implementation ruling, and documented resistance in school districts.",
    ["Brown v Board 1954", "Brown v. Board of Education", "school desegregation 1954"],
    [
      { title: "Brown v. Board of Education", publisher: "National Archives", url: "https://www.archives.gov/milestone-documents/brown-v-board-of-education" },
      { title: "Brown v. Board", publisher: "National Park Service", url: "https://www.nps.gov/brvb/index.htm" },
      { title: "Brown v. Board of Education", publisher: "Library of Congress", url: "https://www.loc.gov/collections/civil-rights-history-project/articles-and-essays/school-segregation-and-integration/" },
      { title: "Brown decision", publisher: "Supreme Court", url: "https://www.oyez.org/cases/1940-1955/347us483" },
      { title: "Brown v. Board", publisher: "Smithsonian Institution", url: "https://nmaahc.si.edu/explore/stories/brown-v-board" },
    ],
    ["Brown v Board of Education 1954"]
  ),
  item(
    "march-on-washington-1963",
    "The March on Washington of 1963: What Happened Beyond the Famous Speech",
    "More than 200,000 people gathered at the Lincoln Memorial with a written set of demands — the day was planned, policed, and argued over in advance.",
    "Politics",
    "Who organized the march, the demands in the program, federal preparation, and what changed in law afterward versus what the march itself accomplished that day.",
    ["March on Washington 1963", "March on Washington for Jobs and Freedom", "Lincoln Memorial 1963"],
    [
      { title: "March on Washington", publisher: "National Archives", url: "https://www.archives.gov/exhibits/eyewitness/html.php?section=14" },
      { title: "March on Washington", publisher: "National Park Service", url: "https://www.nps.gov/articles/march-on-washington.htm" },
      { title: "Civil Rights March on Washington", publisher: "Library of Congress", url: "https://www.loc.gov/item/2013645765/" },
      { title: "March on Washington", publisher: "JFK Presidential Library", url: "https://www.jfklibrary.org/learn/about-jfk/jfk-in-history/civil-rights-movement" },
      { title: "The March on Washington", publisher: "Smithsonian Institution", url: "https://nmaahc.si.edu/explore/stories/march-washington" },
    ],
    ["March on Washington 1963 Lincoln Memorial"]
  ),
  item(
    "japanese-american-incarceration-wwii",
    "Japanese American Incarceration in World War II: What Executive Order 9066 Did",
    "In 1942 the United States forced more than 100,000 people of Japanese ancestry — most of them citizens — out of their homes and into camps.",
    "Politics",
    "Executive Order 9066, the War Relocation Authority camps, documented property loss, Korematsu, and the later redress law.",
    ["Japanese American incarceration", "Executive Order 9066", "internment camps WWII"],
    [
      { title: "Japanese American Confinement Sites", publisher: "National Park Service", url: "https://www.nps.gov/subjects/japaneseamericanconfinement/index.htm" },
      { title: "Executive Order 9066", publisher: "National Archives", url: "https://www.archives.gov/milestone-documents/executive-order-9066" },
      { title: "Japanese American incarceration", publisher: "Library of Congress", url: "https://www.loc.gov/classroom-materials/immigration/japanese/behind-the-wire/" },
      { title: "Manzanar", publisher: "National Park Service", url: "https://www.nps.gov/manz/index.htm" },
      { title: "Japanese American incarceration", publisher: "Smithsonian Institution", url: "https://americanhistory.si.edu/explore/stories/japanese-american-incarceration" },
    ],
    ["Manzanar Japanese American incarceration 1942"]
  ),
  item(
    "cuban-missile-crisis-1962",
    "The Cuban Missile Crisis of 1962: Thirteen Days That Nearly Started a Nuclear War",
    "U.S. spy photos found missile sites in Cuba. For thirteen days in October 1962, Washington negotiated with Moscow while nuclear weapons were already in place.",
    "Military",
    "What the photos showed, the quarantine, the secret deal to remove U.S. missiles from Turkey, and the documented exchanges between Kennedy and Khrushchev.",
    ["Cuban Missile Crisis 1962", "Cuban Missile Crisis", "October 1962 nuclear crisis"],
    [
      { title: "Cuban Missile Crisis", publisher: "JFK Presidential Library", url: "https://www.jfklibrary.org/learn/about-jfk/jfk-in-history/cuban-missile-crisis" },
      { title: "Cuban Missile Crisis", publisher: "National Archives", url: "https://www.archives.gov/research/foreign-policy/cuban-missile-crisis" },
      { title: "Cuban Missile Crisis documents", publisher: "National Security Archive", url: "https://nsarchive.gwu.edu/briefing-book/cuba-cuban-missile-crisis/2022-10-27/cuban-missile-crisis-60" },
      { title: "Missile Crisis", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/october-22/" },
      { title: "Cuban Missile Crisis", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/the-real-story-of-the-cuban-missile-crisis-12802016/" },
    ],
    ["Cuban Missile Crisis October 1962"]
  ),
  item(
    "apollo-11-moon-landing-1969",
    "Apollo 11: What Actually Happened on the First Moon Landing in 1969",
    "Neil Armstrong and Buzz Aldrin landed the Eagle with almost no fuel left. The flight is one of the best-documented events in American history.",
    "Weird America",
    "The mission timeline, the computer alarms during descent, what was said on the surface, and where the flight records and samples are held.",
    ["Apollo 11", "Moon landing 1969", "Neil Armstrong Apollo 11"],
    [
      { title: "Apollo 11", publisher: "NASA", url: "https://www.nasa.gov/mission/apollo-11/" },
      { title: "Apollo 11 mission reports", publisher: "NASA History", url: "https://history.nasa.gov/afj/ap11fj/index.html" },
      { title: "Apollo 11", publisher: "National Archives", url: "https://www.archives.gov/research/space/apollo-11" },
      { title: "Apollo 11", publisher: "Smithsonian National Air and Space Museum", url: "https://airandspace.si.edu/explore/stories/apollo-11" },
      { title: "Moon landing", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/july-20/" },
    ],
    ["Apollo 11 moon landing 1969"]
  ),
  item(
    "exxon-valdez-oil-spill-1989",
    "The Exxon Valdez Oil Spill of 1989: How a Tanker Changed Alaska’s Coast",
    "On March 24, 1989, the Exxon Valdez struck Bligh Reef and spilled millions of gallons of crude into Prince William Sound.",
    "Weird America",
    "How the grounding happened, the documented spill volume, the cleanup limits, the legal settlements, and the later Oil Pollution Act.",
    ["Exxon Valdez oil spill 1989", "Exxon Valdez", "Prince William Sound oil spill"],
    [
      { title: "Exxon Valdez oil spill", publisher: "NOAA", url: "https://response.restoration.noaa.gov/oil-and-chemical-spills/significant-incidents/exxon-valdez-oil-spill" },
      { title: "Exxon Valdez", publisher: "Environmental Protection Agency", url: "https://www.epa.gov/emergency-response/exxon-valdez-spill" },
      { title: "Oil Pollution Act", publisher: "Environmental Protection Agency", url: "https://www.epa.gov/laws-regulations/summary-oil-pollution-act" },
      { title: "Exxon Valdez", publisher: "National Park Service", url: "https://www.nps.gov/articles/exxon-valdez.htm" },
      { title: "Exxon Valdez spill", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/science-nature/exxon-valdez-spill-20-years-later-105128032/" },
    ],
    ["Exxon Valdez oil spill Prince William Sound"]
  ),
  item(
    "battle-of-the-alamo-1836",
    "The Battle of the Alamo in 1836: What the Siege Actually Was",
    "A small Texian force held a former mission in San Antonio for thirteen days against the Mexican army. The popular story leaves out most of the politics.",
    "Military",
    "Why the Alamo was occupied, who was inside, the documented length of the siege, and how the battle was used in the Texas independence campaign afterward.",
    ["Battle of the Alamo 1836", "Alamo siege", "Texas Revolution Alamo"],
    [
      { title: "The Alamo", publisher: "Texas State Historical Association", url: "https://www.tshaonline.org/handbook/entries/alamo" },
      { title: "Alamo", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/march-06/" },
      { title: "San Antonio Missions", publisher: "National Park Service", url: "https://www.nps.gov/saan/index.htm" },
      { title: "Texas Revolution", publisher: "Texas State Library and Archives", url: "https://www.tsl.texas.gov/exhibits/texas175/alamo.html" },
      { title: "The Alamo", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/a-new-look-at-the-alamo-175320080/" },
    ],
    ["Battle of the Alamo 1836"]
  ),
  item(
    "pony-express-1860",
    "The Pony Express of 1860: The Mail Service That Lasted Only 18 Months",
    "Riders carried mail from Missouri to California in about ten days. The telegraph made the whole system obsolete almost as soon as it worked.",
    "Weird America",
    "The route, the stations, what a typical run cost and carried, and why the business closed in 1861.",
    ["Pony Express 1860", "Pony Express history", "Pony Express route"],
    [
      { title: "Pony Express", publisher: "National Park Service", url: "https://www.nps.gov/poex/index.htm" },
      { title: "Pony Express", publisher: "Library of Congress", url: "https://www.loc.gov/item/today-in-history/april-03/" },
      { title: "Pony Express National Historic Trail", publisher: "National Park Service", url: "https://www.nps.gov/places/pony-express-national-historic-trail.htm" },
      { title: "Pony Express", publisher: "Smithsonian Institution", url: "https://postalmuseum.si.edu/exhibition/history-of-the-pony-express" },
      { title: "The Pony Express", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/history/the-brief-life-of-the-pony-express-180980177/" },
    ],
    ["Pony Express rider 1860"]
  ),
  item(
    "selma-to-montgomery-1965",
    "Selma to Montgomery in 1965: The Marches That Forced a Voting Rights Law",
    "A march for voting rights was attacked on the Edmund Pettus Bridge. Two more marches followed, and Congress passed the Voting Rights Act that summer.",
    "Politics",
    "Bloody Sunday, the court order that allowed the completed march, who walked, and what the Voting Rights Act changed in law.",
    ["Selma to Montgomery 1965", "Bloody Sunday Selma", "Voting Rights Act 1965"],
    [
      { title: "Selma to Montgomery", publisher: "National Park Service", url: "https://www.nps.gov/semo/index.htm" },
      { title: "Voting Rights Act", publisher: "National Archives", url: "https://www.archives.gov/milestone-documents/voting-rights-act" },
      { title: "Selma marches", publisher: "Library of Congress", url: "https://www.loc.gov/collections/civil-rights-history-project/articles-and-essays/selma-to-montgomery/" },
      { title: "Bloody Sunday", publisher: "National Park Service", url: "https://www.nps.gov/articles/bloody-sunday.htm" },
      { title: "Selma to Montgomery", publisher: "Smithsonian Institution", url: "https://nmaahc.si.edu/explore/stories/selma-montgomery-march" },
    ],
    ["Selma Montgomery march 1965 Edmund Pettus Bridge"]
  ),
];
