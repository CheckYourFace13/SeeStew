/**
 * Third curated batch — high-search-intent U.S. history topics.
 * Titles/keywords target Google queries people actually type (event + year/place).
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

export const QUEUE_BATCH_3 = [
  item(
    "johnstown-flood-1889",
    "The Johnstown Flood of 1889: How a Broken Dam Killed Over 2,000 People",
    "A private club’s neglected lake wall gave way after days of rain — and a wall of water erased a Pennsylvania valley town.",
    "Weird America",
    "The South Fork Fishing Club dam, the flood wave that hit Johnstown, the death toll, and how the disaster reshaped American dam safety and liability debates.",
    ["Johnstown Flood 1889", "Johnstown Flood", "South Fork Dam collapse", "deadliest floods in US history"],
    [
      { title: "Johnstown Flood", publisher: "National Park Service", url: "https://www.nps.gov/jofl/index.htm" },
      { title: "Johnstown Flood National Memorial", publisher: "National Park Service", url: "https://www.nps.gov/jofl/learn/historyculture/index.htm" },
      { title: "1889 disasters", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Dam safety history", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Johnstown Flood of 1889", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Johnstown Flood 1889 Pennsylvania"]
  ),
  item(
    "great-molasses-flood-1919",
    "The Great Molasses Flood of 1919: When a Sticky Wave Killed 21 in Boston",
    "A towering tank of molasses burst in the North End — and a 25-foot wave of syrup crushed buildings and people.",
    "Weird America",
    "Why the Purity Distilling tank failed, what investigators found about construction shortcuts, and how the disaster entered American industrial-safety lore.",
    ["Great Molasses Flood", "Boston Molasses Flood 1919", "molasses flood Boston", "North End molasses disaster"],
    [
      { title: "Great Molasses Flood", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Boston disasters", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Industrial accidents history", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
      { title: "Engineering failures", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Molasses Flood", publisher: "PBS", url: "https://www.pbs.org/" },
    ],
    ["Boston Molasses Flood 1919"]
  ),
  item(
    "great-chicago-fire-1871",
    "The Great Chicago Fire of 1871: How a City Burned — and Rebuilt Itself",
    "Dry wind, wooden buildings, and a fire that raced for miles turned Chicago into a national symbol of disaster and reinvention.",
    "Weird America",
    "What is known (and mythologized) about how the fire started, the destruction path, and how building codes and urban planning changed afterward.",
    ["Great Chicago Fire 1871", "Chicago Fire 1871", "Great Chicago Fire", "Mrs O'Leary cow myth"],
    [
      { title: "Great Chicago Fire", publisher: "Chicago History Museum", url: "https://www.chicagohistory.org/" },
      { title: "Chicago Fire of 1871", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Fire history", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Urban fire disasters", publisher: "National Fire Protection Association", url: "https://www.nfpa.org/" },
      { title: "Chicago Fire", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Great Chicago Fire 1871"]
  ),
  item(
    "san-francisco-earthquake-1906",
    "The 1906 San Francisco Earthquake: Quake, Fire, and a City Remade",
    "The ground shook for less than a minute — then fires finished what the earthquake started.",
    "Weird America",
    "The April 18 quake, the firestorm that followed, the death and displacement toll, and how San Francisco’s recovery became a national story.",
    ["1906 San Francisco earthquake", "San Francisco earthquake 1906", "1906 earthquake fire", "deadliest earthquakes US"],
    [
      { title: "1906 San Francisco Earthquake", publisher: "USGS", url: "https://earthquake.usgs.gov/earthquakes/events/1906calif/" },
      { title: "San Francisco Earthquake and Fire", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "1906 earthquake", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Earthquake history", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "1906 disaster", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["San Francisco earthquake 1906"]
  ),
  item(
    "monongah-mining-disaster-1907",
    "The Monongah Mining Disaster of 1907: America’s Deadliest Coal Mine Explosion",
    "An underground blast in West Virginia killed hundreds of miners in minutes — and pushed mine safety into national politics.",
    "Weird America",
    "What caused the explosion, who died, and how Monongah helped drive federal mine-safety legislation.",
    ["Monongah mining disaster", "Monongah mine explosion 1907", "deadliest mining disaster US", "West Virginia mine disaster"],
    [
      { title: "Mine disasters", publisher: "MSHA", url: "https://www.msha.gov/" },
      { title: "Monongah Mine Disaster", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Coal mining history", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Mine safety", publisher: "CDC NIOSH", url: "https://www.cdc.gov/niosh/" },
      { title: "West Virginia mining", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Monongah mining disaster 1907"]
  ),
  item(
    "donner-party-1846",
    "The Donner Party: How a Shortcut Turned Into America’s Most Infamous Survival Story",
    "A delayed Sierra Nevada crossing left emigrants trapped by snow — and forced choices that still shock readers.",
    "Weird America",
    "The Hastings Cutoff decision, the winter encampments, rescue attempts, and what primary accounts actually document about cannibalism and survival.",
    ["Donner Party", "Donner Party 1846", "Donner Party cannibalism", "Sierra Nevada wagon train"],
    [
      { title: "Donner Party", publisher: "National Park Service", url: "https://www.nps.gov/places/000/donner-party.htm" },
      { title: "Donner Memorial", publisher: "California State Parks", url: "https://www.parks.ca.gov/" },
      { title: "Overland migration", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Western expansion", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Donner Party history", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Donner Party 1846 Sierra Nevada"]
  ),
  item(
    "lost-colony-roanoke",
    "The Lost Colony of Roanoke: What Happened to England’s First Attempt at America?",
    "A settlement vanished. The word CROATOAN was carved into a post. Centuries later, the mystery still draws searches.",
    "Weird America",
    "John White’s delayed return, the archaeological and documentary evidence, and the leading historical theories — without inventing a neat ending.",
    ["Lost Colony of Roanoke", "Roanoke Colony mystery", "CROATOAN Roanoke", "what happened to Roanoke"],
    [
      { title: "Roanoke Colonies", publisher: "National Park Service", url: "https://www.nps.gov/fora/learn/historyculture/roanoke.htm" },
      { title: "Roanoke", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Colonial America", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Lost Colony", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
      { title: "Fort Raleigh", publisher: "National Park Service", url: "https://www.nps.gov/fora/index.htm" },
    ],
    ["Lost Colony Roanoke CROATOAN"]
  ),
  item(
    "trail-of-tears",
    "The Trail of Tears: Forced Removal of the Cherokee and the Human Cost of Indian Removal",
    "Thousands of Cherokee were marched west under federal policy — and thousands died along the way.",
    "Weird America",
    "The Indian Removal Act, Worcester v. Georgia, Treaty of New Echota controversies, and the documented death toll of the forced marches.",
    ["Trail of Tears", "Trail of Tears Cherokee", "Indian Removal Act", "Cherokee removal history"],
    [
      { title: "Trail of Tears", publisher: "National Park Service", url: "https://www.nps.gov/trte/index.htm" },
      { title: "Indian Removal", publisher: "National Archives", url: "https://www.archives.gov/research/native-americans/indian-removal" },
      { title: "Cherokee Nation history", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Indian Removal Act", publisher: "U.S. Congress", url: "https://www.congress.gov/" },
      { title: "Trail of Tears", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Trail of Tears Cherokee removal"]
  ),
  item(
    "wounded-knee-massacre-1890",
    "The Wounded Knee Massacre of 1890: How a Disarmament Ended in Mass Killing",
    "On the Pine Ridge Reservation, a confrontation over weapons became one of the darkest days in U.S.–Native American history.",
    "Weird America",
    "The Ghost Dance context, the killing of Sitting Bull, the December 29 massacre, Medal of Honor controversies, and later remembrance.",
    ["Wounded Knee Massacre 1890", "Wounded Knee 1890", "Pine Ridge massacre", "Ghost Dance Wounded Knee"],
    [
      { title: "Wounded Knee", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Wounded Knee Massacre", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Native American history", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Pine Ridge history", publisher: "Smithsonian National Museum of the American Indian", url: "https://americanindian.si.edu/" },
      { title: "Wounded Knee 1890", publisher: "PBS", url: "https://www.pbs.org/" },
    ],
    ["Wounded Knee Massacre 1890"]
  ),
  item(
    "little-bighorn-1876",
    "Custer’s Last Stand at Little Bighorn: What Really Happened in 1876",
    "George Armstrong Custer rode into a Lakota, Northern Cheyenne, and Arapaho alliance — and his command was wiped out.",
    "Weird America",
    "The campaign that led to the battle, how Native coalitions fought, and what archaeology and Native accounts add beyond the myth of “Last Stand.”",
    ["Battle of Little Bighorn", "Custer's Last Stand", "Little Bighorn 1876", "what happened at Little Bighorn"],
    [
      { title: "Little Bighorn Battlefield", publisher: "National Park Service", url: "https://www.nps.gov/libi/index.htm" },
      { title: "Battle of the Little Bighorn", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Great Sioux War", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Little Bighorn", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
      { title: "Custer battlefield", publisher: "National Park Service", url: "https://www.nps.gov/libi/learn/historyculture/index.htm" },
    ],
    ["Little Bighorn Custer 1876"]
  ),
  item(
    "boston-massacre-1770",
    "The Boston Massacre of 1770: How Five Deaths Became Revolutionary Propaganda",
    "British soldiers fired into a crowd on King Street — and Paul Revere’s engraving turned the killings into a cause.",
    "Weird America",
    "What witnesses said happened, the trials defended by John Adams, and how the event became a recruiting tool for independence.",
    ["Boston Massacre 1770", "Boston Massacre", "Paul Revere Boston Massacre", "King Street shooting"],
    [
      { title: "Boston Massacre", publisher: "National Park Service", url: "https://www.nps.gov/bost/learn/historyculture/massacre.htm" },
      { title: "Boston Massacre", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Revolutionary era", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "John Adams and the Boston Massacre", publisher: "Massachusetts Historical Society", url: "https://www.masshist.org/" },
      { title: "Boston Massacre", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Boston Massacre 1770"]
  ),
  item(
    "kent-state-shootings-1970",
    "The Kent State Shootings of 1970: When the National Guard Fired on Students",
    "Four students died on an Ohio campus — and a photograph of a screaming teenager became the face of Vietnam-era protest.",
    "Weird America",
    "Why Guard troops were on campus, what investigations concluded about the shootings, and how Kent State changed American politics and campus life.",
    ["Kent State shooting 1970", "Kent State massacre", "May 4 Kent State", "National Guard Kent State"],
    [
      { title: "Kent State Shootings", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Kent State", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "May 4 Collection", publisher: "Kent State University", url: "https://www.kent.edu/" },
      { title: "Vietnam War protests", publisher: "PBS", url: "https://www.pbs.org/" },
      { title: "Kent State 1970", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Kent State shootings 1970"]
  ),
  item(
    "my-lai-massacre-1968",
    "The My Lai Massacre: The Vietnam Atrocity America Tried to Bury",
    "U.S. soldiers killed hundreds of Vietnamese civilians — and a cover-up delayed the truth for more than a year.",
    "Weird America",
    "What happened in Son My, how Ronald Ridenhour and journalists exposed it, the courts-martial, and why My Lai still defines debates about the war.",
    ["My Lai Massacre", "My Lai Massacre 1968", "Vietnam My Lai", "William Calley My Lai"],
    [
      { title: "My Lai Massacre", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Vietnam War", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "My Lai", publisher: "U.S. Army Center of Military History", url: "https://history.army.mil/" },
      { title: "My Lai investigation", publisher: "PBS", url: "https://www.pbs.org/" },
      { title: "My Lai Massacre", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["My Lai Massacre 1968 Vietnam"]
  ),
  item(
    "stonewall-riots-1969",
    "The Stonewall Riots of 1969: How a Police Raid Sparked a Movement",
    "A raid on a Greenwich Village bar met unexpected resistance — and LGBTQ activism in America entered a new phase.",
    "Weird America",
    "What led to the raid, what happened over those nights, and how Stonewall became a national (and global) landmark of protest history.",
    ["Stonewall Riots 1969", "Stonewall uprising", "Stonewall Inn raid", "LGBTQ rights Stonewall"],
    [
      { title: "Stonewall National Monument", publisher: "National Park Service", url: "https://www.nps.gov/ston/index.htm" },
      { title: "Stonewall", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "LGBTQ history", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Stonewall Riots", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
      { title: "Stonewall", publisher: "PBS", url: "https://www.pbs.org/" },
    ],
    ["Stonewall Riots 1969 New York"]
  ),
  item(
    "montgomery-bus-boycott-1955",
    "The Montgomery Bus Boycott: How 381 Days of Walking Changed America",
    "Rosa Parks’s arrest was the spark — but a year-long boycott and a Supreme Court ruling ended bus segregation in Montgomery.",
    "Weird America",
    "The Women’s Political Council groundwork, Martin Luther King Jr.’s leadership role, car pools and church organizing, and Browder v. Gayle.",
    ["Montgomery Bus Boycott", "Montgomery Bus Boycott 1955", "Rosa Parks bus", "Browder v Gayle"],
    [
      { title: "Montgomery Bus Boycott", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Civil Rights Movement", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Rosa Parks", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Montgomery Bus Boycott", publisher: "PBS", url: "https://www.pbs.org/" },
      { title: "Civil rights history", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Montgomery Bus Boycott 1955 Rosa Parks"]
  ),
  item(
    "scottsboro-boys",
    "The Scottsboro Boys: Nine Black Teens, False Accusations, and a Supreme Court Fight",
    "A freight-train encounter in Alabama became one of the most infamous wrongful-prosecution cases in U.S. history.",
    "Weird America",
    "The 1931 arrests, the rushed trials, international protests, and the Supreme Court decisions that reshaped criminal due process.",
    ["Scottsboro Boys", "Scottsboro Boys case", "Scottsboro Boys trial", "Powell v Alabama"],
    [
      { title: "Scottsboro Boys", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Scottsboro", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Powell v. Alabama", publisher: "U.S. Courts", url: "https://www.uscourts.gov/" },
      { title: "Scottsboro Boys", publisher: "PBS", url: "https://www.pbs.org/" },
      { title: "Scottsboro case", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Scottsboro Boys 1931 Alabama"]
  ),
  item(
    "sacco-vanzetti-trial",
    "Sacco and Vanzetti: The Trial That Divided America Over Justice and Fear",
    "Two Italian anarchists were convicted of murder — and millions worldwide believed the verdict was about politics, not evidence.",
    "Weird America",
    "The Braintree robbery, the courtroom atmosphere of the Red Scare era, appeals and clemency fights, and why the case still matters to American legal history.",
    ["Sacco and Vanzetti", "Sacco Vanzetti trial", "Sacco and Vanzetti execution", "Red Scare trial"],
    [
      { title: "Sacco and Vanzetti", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Sacco-Vanzetti case", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Massachusetts history", publisher: "Massachusetts Historical Society", url: "https://www.masshist.org/" },
      { title: "Sacco and Vanzetti", publisher: "PBS", url: "https://www.pbs.org/" },
      { title: "Sacco Vanzetti", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Sacco and Vanzetti trial"]
  ),
  item(
    "lindbergh-kidnapping-1932",
    "The Lindbergh Kidnapping: The “Crime of the Century” That Changed American Law",
    "Charles Lindbergh’s infant son was taken from a New Jersey nursery — and the investigation became a national obsession.",
    "Weird America",
    "The ransom notes, Bruno Richard Hauptmann’s trial, media frenzy, and how the case led to the Federal Kidnapping Act (“Lindbergh Law”).",
    ["Lindbergh kidnapping", "Lindbergh baby kidnapping 1932", "Bruno Hauptmann", "Lindbergh Law"],
    [
      { title: "Lindbergh Kidnapping", publisher: "FBI", url: "https://www.fbi.gov/history/famous-cases/the-lindbergh-kidnapping" },
      { title: "Lindbergh case", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Lindbergh kidnapping", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Crime of the century", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
      { title: "Lindbergh", publisher: "PBS", url: "https://www.pbs.org/" },
    ],
    ["Lindbergh kidnapping 1932"]
  ),
  item(
    "pentagon-papers-1971",
    "The Pentagon Papers: The Secret Vietnam History That Reached the Front Page",
    "A classified Defense Department study leaked — and the Supreme Court backed the press against prior restraint.",
    "Weird America",
    "Daniel Ellsberg’s leak, the New York Times and Washington Post fight, New York Times Co. v. United States, and what the papers revealed about Vietnam decision-making.",
    ["Pentagon Papers", "Pentagon Papers 1971", "Daniel Ellsberg", "New York Times v United States"],
    [
      { title: "Pentagon Papers", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Pentagon Papers", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "New York Times Co. v. United States", publisher: "U.S. Courts", url: "https://www.uscourts.gov/" },
      { title: "Pentagon Papers", publisher: "National Security Archive / GWU (edu)", url: "https://nsarchive.gwu.edu/" },
      { title: "Pentagon Papers", publisher: "PBS", url: "https://www.pbs.org/" },
    ],
    ["Pentagon Papers 1971 Ellsberg"]
  ),
  item(
    "manhattan-project",
    "The Manhattan Project: How America Built the Atomic Bomb in Secret",
    "Across Los Alamos, Oak Ridge, and Hanford, a wartime project remade physics — and the world — before most Americans knew it existed.",
    "Weird America",
    "Why the project started, how the sites worked, Trinity, and the decision to use the bomb — grounded in declassified history, not myth.",
    ["Manhattan Project", "Manhattan Project atomic bomb", "Los Alamos Manhattan Project", "Trinity test 1945"],
    [
      { title: "Manhattan Project", publisher: "Department of Energy", url: "https://www.energy.gov/lm/doe-history/manhattan-project" },
      { title: "Manhattan Project National Historical Park", publisher: "National Park Service", url: "https://www.nps.gov/mapr/index.htm" },
      { title: "Atomic bomb history", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Manhattan Project", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Los Alamos history", publisher: "Los Alamos National Laboratory", url: "https://www.lanl.gov/" },
    ],
    ["Manhattan Project Los Alamos"]
  ),
  item(
    "roswell-incident-1947",
    "The Roswell Incident of 1947: Balloon Debris, a Retracted Story, and a UFO Legend",
    "The Army first said it recovered a “flying disc.” Then it said weather balloon. Decades of secrecy (and Project Mogul) fueled a myth.",
    "Weird America",
    "What the 1947 press releases actually said, what later Air Force reports concluded about Project Mogul, and how Roswell became America’s most searched UFO story — without claiming aliens.",
    ["Roswell incident 1947", "Roswell UFO", "Project Mogul Roswell", "what happened at Roswell"],
    [
      { title: "Roswell Report", publisher: "U.S. Air Force", url: "https://www.af.mil/" },
      { title: "Project Mogul", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "UFO investigations", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Roswell history", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
      { title: "Cold War balloon projects", publisher: "NASA", url: "https://www.nasa.gov/" },
    ],
    ["Roswell incident 1947 Project Mogul"]
  ),
  item(
    "homestead-strike-1892",
    "The Homestead Strike of 1892: Carnegie Steel, Pinkertons, and a Bloody Lockout",
    "Workers fought a private army on the Monongahela — and the battle became a defining clash of the Gilded Age.",
    "Weird America",
    "Why Homestead locked out the Amalgamated Association, the Pinkerton landing fight, the Pennsylvania militia, and the strike’s long aftermath for labor.",
    ["Homestead Strike 1892", "Homestead Strike", "Carnegie Homestead", "Pinkerton Homestead"],
    [
      { title: "Homestead Strike", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Labor history", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Homestead", publisher: "National Park Service", url: "https://www.nps.gov/" },
      { title: "Homestead Strike", publisher: "PBS", url: "https://www.pbs.org/" },
      { title: "Gilded Age labor", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Homestead Strike 1892"]
  ),
  item(
    "pullman-strike-1894",
    "The Pullman Strike of 1894: When a Railroad Boycott Brought in Federal Troops",
    "A company-town wage cut sparked a national rail shutdown — and President Cleveland sent troops into Chicago.",
    "Weird America",
    "George Pullman’s town, Eugene Debs and the ARU, the injunction that crushed the strike, and how Labor Day politics intersected with the crisis.",
    ["Pullman Strike 1894", "Pullman Strike", "Eugene Debs Pullman", "Pullman railroad strike"],
    [
      { title: "Pullman Strike", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Pullman Strike", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Labor Day history", publisher: "U.S. Department of Labor", url: "https://www.dol.gov/" },
      { title: "Pullman", publisher: "National Park Service", url: "https://www.nps.gov/pull/index.htm" },
      { title: "Pullman Strike", publisher: "PBS", url: "https://www.pbs.org/" },
    ],
    ["Pullman Strike 1894 Chicago"]
  ),
  item(
    "attica-prison-riot-1971",
    "The Attica Prison Uprising of 1971: Four Days That Ended in a Storm of Gunfire",
    "Inmates took control of a New York prison demanding basic rights — then state forces retook Attica in a bloody assault.",
    "Weird America",
    "What prisoners demanded, the negotiations, the September 13 retaking, the death toll, and later investigations into state responsibility.",
    ["Attica prison riot 1971", "Attica uprising", "Attica prison massacre", "Attica 1971"],
    [
      { title: "Attica uprising", publisher: "New York State Archives", url: "https://www.archives.nysed.gov/" },
      { title: "Attica", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Prison reform history", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Attica", publisher: "PBS", url: "https://www.pbs.org/" },
      { title: "Attica 1971", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Attica prison riot 1971"]
  ),
  item(
    "waco-siege-1993",
    "The Waco Siege of 1993: How a 51-Day Standoff Ended in Fire",
    "Federal agents tried to serve a warrant at Mount Carmel — and the confrontation with the Branch Davidians ended with dozens dead.",
    "Weird America",
    "The ATF raid, the FBI siege, the April 19 fire, official death counts, and how later investigations framed failures on all sides — without conspiracy invention.",
    ["Waco siege 1993", "Waco Branch Davidians", "Mount Carmel Waco", "Waco fire 1993"],
    [
      { title: "Waco investigation", publisher: "Department of Justice", url: "https://www.justice.gov/" },
      { title: "Waco", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Waco siege", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Branch Davidians Waco", publisher: "FBI", url: "https://www.fbi.gov/" },
      { title: "Waco 1993", publisher: "PBS", url: "https://www.pbs.org/" },
    ],
    ["Waco siege 1993 Branch Davidians"]
  ),
  item(
    "oklahoma-city-bombing-1995",
    "The Oklahoma City Bombing: The Domestic Terror Attack That Shook 1995 America",
    "A truck bomb destroyed the Alfred P. Murrah Federal Building — killing 168 people in the deadliest act of domestic terrorism in U.S. history.",
    "Weird America",
    "Timothy McVeigh and Terry Nichols, the investigation, the victims (including children in the daycare), and how the attack changed domestic security.",
    ["Oklahoma City bombing", "Oklahoma City bombing 1995", "Murrah Building bombing", "Timothy McVeigh"],
    [
      { title: "Oklahoma City Bombing", publisher: "FBI", url: "https://www.fbi.gov/history/famous-cases/oklahoma-city-bombing" },
      { title: "Oklahoma City National Memorial", publisher: "National Park Service", url: "https://www.nps.gov/okci/index.htm" },
      { title: "Oklahoma City bombing", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Domestic terrorism", publisher: "Department of Justice", url: "https://www.justice.gov/" },
      { title: "Oklahoma City", publisher: "Library of Congress", url: "https://www.loc.gov/" },
    ],
    ["Oklahoma City bombing 1995"]
  ),
  item(
    "hurricane-katrina-2005",
    "Hurricane Katrina: How the Levees Failed New Orleans",
    "The storm was deadly — but the failed floodwalls and the slow response turned Katrina into a national reckoning.",
    "Weird America",
    "What the hurricane did, why the levees failed, the Superdome and evacuation crisis, and what federal investigations concluded about preparedness.",
    ["Hurricane Katrina", "Hurricane Katrina 2005", "New Orleans levee failure", "Katrina flooding"],
    [
      { title: "Hurricane Katrina", publisher: "NOAA", url: "https://www.noaa.gov/" },
      { title: "Katrina levee failures", publisher: "U.S. Army Corps of Engineers", url: "https://www.usace.army.mil/" },
      { title: "Hurricane Katrina", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Katrina", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Katrina response", publisher: "PBS", url: "https://www.pbs.org/" },
    ],
    ["Hurricane Katrina 2005 New Orleans"]
  ),
  item(
    "flint-water-crisis",
    "The Flint Water Crisis: How a City’s Drinking Water Became a National Scandal",
    "A cost-cutting switch of water sources exposed residents — including thousands of children — to lead contamination.",
    "Weird America",
    "The 2014 switch to the Flint River, corrosion control failures, Legionella concerns, state and federal responses, and why the crisis became a symbol of environmental injustice.",
    ["Flint water crisis", "Flint Michigan lead water", "Flint River water switch", "lead in Flint water"],
    [
      { title: "Flint Water Crisis", publisher: "EPA", url: "https://www.epa.gov/" },
      { title: "Flint lead exposure", publisher: "CDC", url: "https://www.cdc.gov/" },
      { title: "Flint water", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Environmental justice", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Flint water crisis", publisher: "NPR", url: "https://www.npr.org/" },
    ],
    ["Flint water crisis lead"]
  ),
  item(
    "deepwater-horizon-2010",
    "Deepwater Horizon: The Oil Spill That Gushed for 87 Days",
    "An explosion on a BP drilling rig killed 11 workers — then crude poured into the Gulf of Mexico for nearly three months.",
    "Weird America",
    "What failed on the Macondo well, the human and environmental toll, and how the disaster changed offshore drilling oversight.",
    ["Deepwater Horizon", "Deepwater Horizon oil spill", "BP oil spill 2010", "Macondo well blowout"],
    [
      { title: "Deepwater Horizon", publisher: "NOAA", url: "https://www.noaa.gov/" },
      { title: "Oil spill response", publisher: "EPA", url: "https://www.epa.gov/" },
      { title: "Deepwater Horizon", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Offshore drilling", publisher: "Bureau of Ocean Energy Management", url: "https://www.boem.gov/" },
      { title: "Deepwater Horizon", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
    ],
    ["Deepwater Horizon oil spill 2010"]
  ),
  item(
    "great-baltimore-fire-1904",
    "The Great Baltimore Fire of 1904: 30 Hours That Remade a City",
    "A warehouse blaze jumped firebreaks and burned downtown Baltimore for more than a day — exposing how poorly American cities were prepared to help each other.",
    "Weird America",
    "How the fire spread, why visiting fire companies’ hoses didn’t fit Baltimore hydrants, and how the disaster pushed national firefighting standards.",
    ["Great Baltimore Fire 1904", "Baltimore Fire 1904", "Baltimore downtown fire", "fire hose coupling standards"],
    [
      { title: "Baltimore Fire of 1904", publisher: "Library of Congress", url: "https://www.loc.gov/" },
      { title: "Great Baltimore Fire", publisher: "National Archives", url: "https://www.archives.gov/" },
      { title: "Fire standards history", publisher: "National Fire Protection Association", url: "https://www.nfpa.org/" },
      { title: "Baltimore history", publisher: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/" },
      { title: "Urban fires", publisher: "National Park Service", url: "https://www.nps.gov/" },
    ],
    ["Great Baltimore Fire 1904"]
  ),
];
