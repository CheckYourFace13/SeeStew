/**
 * Curated seasonal full-story seeds — Christmas / New Year / winter first.
 * Merged by id like other batches. No generic holiday filler.
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
    seasonal: true,
    ...extras,
  };
}

export const QUEUE_SEASONAL = [
  item(
    "washington-crossing-delaware-1776",
    "Washington’s Crossing: The Christmas Night That Saved the Revolution",
    "On Christmas night 1776, Washington’s army crossed an ice-choked Delaware River for a dawn attack that reversed the war’s momentum.",
    "Revolution",
    "Why the Continental Army risked a night crossing in a nor’easter, how the Durham boats and Marblehead sailors made it possible, what happened at Trenton the next morning, and why the gamble mattered after the defeats of 1776.",
    [
      "Washington Crossing Delaware 1776",
      "Christmas night Delaware River",
      "Battle of Trenton prelude",
      "winter campaign",
    ],
    [
      {
        title: "Washington Crossing Historic Park",
        publisher: "National Park Service",
        url: "https://www.nps.gov/waco/index.htm",
      },
      {
        title: "The Crossing",
        publisher: "Mount Vernon",
        url: "https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/the-crossing",
      },
      {
        title: "Washington’s Crossing",
        publisher: "Library of Congress",
        url: "https://www.loc.gov/item/today-in-history/december-25/",
      },
      {
        title: "Founders Online — Washington papers",
        publisher: "National Archives",
        url: "https://founders.archives.gov/",
      },
      {
        title: "Washington Crossing the Delaware",
        publisher: "American Battlefield Trust",
        url: "https://www.battlefields.org/learn/articles/washingtons-crossing",
      },
    ],
    ["Washington Crossing Delaware Christmas 1776"],
    {
      eventYear: 1776,
      historicalEra: "revolution-early-republic",
      canonicalEventId: "washington-crossing-delaware-1776",
    }
  ),
  item(
    "battle-of-trenton-1776",
    "The Battle of Trenton: How a Dawn Raid After Christmas Shocked the Hessians",
    "Hours after the Delaware crossing, Washington’s exhausted troops overran a Hessian garrison at Trenton — a tactical win that revived Patriot enlistments.",
    "Revolution",
    "What the Hessian garrison expected on December 26, how the American columns arrived, casualties and prisoners, and how Trenton plus Princeton changed winter recruiting.",
    [
      "Battle of Trenton 1776",
      "Hessian garrison Trenton",
      "December 26 Revolution",
      "Princeton campaign",
    ],
    [
      {
        title: "Battle of Trenton",
        publisher: "American Battlefield Trust",
        url: "https://www.battlefields.org/learn/revolutionary-war/battles/trenton",
      },
      {
        title: "Trenton Barracks",
        publisher: "National Park Service",
        url: "https://www.nps.gov/articles/000/old-barracks.htm",
      },
      {
        title: "Today in History — December 26",
        publisher: "Library of Congress",
        url: "https://www.loc.gov/item/today-in-history/december-26/",
      },
      {
        title: "Founders Online",
        publisher: "National Archives",
        url: "https://founders.archives.gov/",
      },
      {
        title: "Ten Crucial Days",
        publisher: "Mount Vernon",
        url: "https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/ten-crucial-days",
      },
    ],
    ["Battle of Trenton December 1776"],
    {
      eventYear: 1776,
      historicalEra: "revolution-early-republic",
      canonicalEventId: "battle-of-trenton-1776",
    }
  ),
  item(
    "valley-forge-winter-1777",
    "Valley Forge: The Winter Camp That Remade the Continental Army",
    "At Valley Forge in 1777–78, hunger, disease, and drill under von Steuben turned a fraying army into a force that could fight the British in open field.",
    "Revolution",
    "Why Washington chose the Schuylkill camp, what supply failures and disease did to the ranks, how Baron von Steuben’s training changed drill, and what left the camp in June 1778.",
    [
      "Valley Forge winter 1777",
      "von Steuben Continental Army",
      "Revolutionary War encampment",
      "winter history",
    ],
    [
      {
        title: "Valley Forge National Historical Park",
        publisher: "National Park Service",
        url: "https://www.nps.gov/vafo/index.htm",
      },
      {
        title: "Valley Forge",
        publisher: "Mount Vernon",
        url: "https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/valley-forge",
      },
      {
        title: "Today in History — Valley Forge",
        publisher: "Library of Congress",
        url: "https://www.loc.gov/item/today-in-history/december-19/",
      },
      {
        title: "Founders Online",
        publisher: "National Archives",
        url: "https://founders.archives.gov/",
      },
      {
        title: "Baron von Steuben",
        publisher: "National Park Service",
        url: "https://www.nps.gov/articles/000/von-steuben.htm",
      },
    ],
    ["Valley Forge winter encampment 1777"],
    {
      eventYear: 1777,
      historicalEra: "revolution-early-republic",
      canonicalEventId: "valley-forge-winter-1777",
    }
  ),
  item(
    "eggnog-riot-west-point-1826",
    "The Eggnog Riot: When West Point Cadets Turned Christmas Into a Barracks Brawl",
    "On Christmas 1826, alcohol-smuggling cadets at West Point assaulted officers, smashed barracks, and triggered courts-martial that expelled a tenth of the corps.",
    "Military",
    "Why Sylvanus Thayer’s liquor ban collided with Christmas eggnog tradition, how cadets smuggled whiskey across the Hudson, what happened in North Barracks before dawn, and how the 1827 courts-martial reshaped Academy discipline — including Jefferson Davis’s near-miss.",
    [
      "Eggnog Riot West Point",
      "Christmas 1826 cadets",
      "Sylvanus Thayer",
      "USMA court martial 1827",
    ],
    [
      {
        title: "The Eggnog Riot",
        publisher: "U.S. Army",
        url: "https://www.army.mil/article/49823/the_eggnog_riot",
      },
      {
        title: "USMA Library Archives & Special Collections",
        publisher: "U.S. Military Academy",
        url: "https://guides.library.westpoint.edu/asc",
      },
      {
        title: "West Point history",
        publisher: "National Park Service",
        url: "https://www.nps.gov/wepo/index.htm",
      },
      {
        title: "Military school, West Point, N.Y.",
        publisher: "Library of Congress",
        url: "https://www.loc.gov/item/2016800085/",
      },
      {
        title: "Record Group 404 — USMA",
        publisher: "National Archives",
        url: "https://www.archives.gov/research/guide-fed-records/groups/404.html",
      },
    ],
    ["Eggnog Riot West Point Christmas 1826"],
    {
      eventYear: 1826,
      historicalEra: "antebellum-civil-war",
      canonicalEventId: "eggnog-riot-west-point-1826",
    }
  ),
  item(
    "battle-of-the-bulge-1944",
    "The Battle of the Bulge: Hitler’s Last Gamble in the Frozen Ardennes",
    "In December 1944, a surprise German offensive smashed through the Ardennes in bitter cold — and American units at Bastogne and elsewhere held the line.",
    "Military",
    "Why German planners chose the Ardennes, how weather grounded Allied air power, what Bastogne’s siege meant, and how the counterattack restored the front by January 1945.",
    [
      "Battle of the Bulge 1944",
      "Bastogne siege",
      "Ardennes winter offensive",
      "December WWII",
    ],
    [
      {
        title: "Battle of the Bulge",
        publisher: "U.S. Army Center of Military History",
        url: "https://history.army.mil/html/reference/bulge/index.html",
      },
      {
        title: "Ardennes-Alsace",
        publisher: "U.S. Army",
        url: "https://www.army.mil/article/92810/battle_of_the_bulge",
      },
      {
        title: "Battle of the Bulge",
        publisher: "National Archives",
        url: "https://www.archives.gov/research/military/ww2/bulge",
      },
      {
        title: "World War II",
        publisher: "National Park Service",
        url: "https://www.nps.gov/subjects/worldwarii/index.htm",
      },
      {
        title: "Today in History — Battle of the Bulge",
        publisher: "Library of Congress",
        url: "https://www.loc.gov/item/today-in-history/december-16/",
      },
    ],
    ["Battle of the Bulge Ardennes December 1944"],
    {
      eventYear: 1944,
      historicalEra: "world-war-ii",
      canonicalEventId: "battle-of-the-bulge-1944",
    }
  ),
  item(
    "knickerbocker-theatre-collapse-1922",
    "The Knickerbocker Theatre Collapse: When a Roof Full of Snow Killed 98 in Washington",
    "On January 28, 1922, the roof of Washington’s Knickerbocker Theatre failed under a record snow load during a silent-film showing — one of the capital’s deadliest disasters.",
    "Disasters",
    "How the Knickerbocker Storm loaded the roof, why the steel-and-concrete design failed, how rescue and identification unfolded, and what building-code changes followed in the District.",
    [
      "Knickerbocker Theatre collapse 1922",
      "Washington DC snow disaster",
      "January 28 1922",
      "winter history",
    ],
    [
      {
        title: "The Knickerbocker Storm",
        publisher: "NOAA",
        url: "https://www.weather.gov/lwx/knickerbocker",
      },
      {
        title: "Today in History — January 28",
        publisher: "Library of Congress",
        url: "https://www.loc.gov/item/today-in-history/january-28/",
      },
      {
        title: "District of Columbia records",
        publisher: "National Archives",
        url: "https://www.archives.gov/",
      },
      {
        title: "Historic American Buildings Survey",
        publisher: "Library of Congress",
        url: "https://www.loc.gov/pictures/collection/hh/",
      },
      {
        title: "Washington, D.C. history",
        publisher: "National Park Service",
        url: "https://www.nps.gov/subjects/washington-dc/index.htm",
      },
    ],
    ["Knickerbocker Theatre collapse snow 1922"],
    {
      eventYear: 1922,
      historicalEra: "twenties-depression",
      canonicalEventId: "knickerbocker-theatre-collapse-1922",
    }
  ),
];
