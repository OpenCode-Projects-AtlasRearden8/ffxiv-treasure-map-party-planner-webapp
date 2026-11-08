const TARMAP_TIERS = [
  "Timeworn Leather Map",
  "Timeworn Brass Map",
  "Timeworn Goatskin Map",
  "Timeworn Toadskin Map",
  "Timeworn Boarskin Map",
  "Timeworn Peiste Map",
  "Timeworn Archaeosian Map",
  "Timeworn Wyvernskin Map",
  "Timeworn Dragonskin Map",
  "Timeworn Gazelleskin Map",
  "Timeworn Skybuilders' Map",
  "Timeworn Zonureskin Map",
  "Timeworn Kumbhiraskin Map",
  "Timeworn Ophiotauroskin Map",
];

const ERAS = [
  {
    era: "A Realm Reborn zones",
    re: /^Timeworn (Leather|Brass|Goatskin|Toadskin|Boarskin|Peiste) Map$/,
  },
  {
    era: "Heavensward zones",
    re: /^Timeworn (Archaeosian|Wyvernskin|Dragonskin) Map$/,
  },
  {
    era: "Stormblood zones",
    re: /^Timeworn Gazelleskin Map$/,
  },
  {
    era: "Shadowbringers zones",
    re: /^Timeworn Skybuilders' Map$/,
  },
  {
    era: "Endwalker zones",
    re: /^Timeworn Zonureskin Map$/,
  },
  {
    era: "Dawntrail zones",
    re: /^Timeworn (Kumbhiraskin|Ophiotauroskin) Map$/,
  },
];

function classifyZones(tier) {
  const hit = ERAS.find((e) => e.re.test(tier));
  return hit ? hit.era : "Custom / other";
}

export { TARMAP_TIERS, classifyZones };
