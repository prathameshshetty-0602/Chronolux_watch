import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type ProductType, type Gender } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const categories = [
  ["Smart Watches", "smart-watches", "Connected timepieces for everyday performance."],
  ["Luxury Watches", "luxury-watches", "Statement pieces shaped by fine materials."],
  ["Analog Watches", "analog-watches", "Classic dial-led designs for every occasion."],
  ["Digital Watches", "digital-watches", "Clear, precise digital timekeeping."],
  ["Sports Watches", "sports-watches", "Built to move through training and the outdoors."],
  ["Casual Watches", "casual-watches", "Easy, versatile companions for every day."],
  ["Automatic Watches", "automatic-watches", "Self-winding mechanical craftsmanship."],
  ["Mechanical Watches", "mechanical-watches", "Traditional movements with considered detail."],
  ["Chronograph Watches", "chronograph-watches", "Precision timing with stopwatch capability."],
  ["Couple Watches", "couple-watches", "Complementary designs made to be worn together."],
  ["Men's Watches", "mens-watches", "A considered edit of men's watches."],
  ["Women's Watches", "womens-watches", "A considered edit of women's watches."],
  ["Kids' Watches", "kids-watches", "Comfortable, clear and resilient watches for kids."],
] as const;

const brands = [
  ["ChronoLux", "chronolux"], ["Atelier No. 8", "atelier-no-8"],
  ["Meridian Works", "meridian-works"], ["Aster & Vale", "aster-and-vale"],
  ["Northline", "northline"], ["Forma Studio", "forma-studio"],
] as const;

type SeedProduct = {
  slug: string; name: string; model: string; brand: string; category: string;
  type: ProductType; gender: Gender; price: number; compareAtPrice: number | null;
  stock: number; desc: string; display: string; caseMaterial: string; strap: string;
  movement: string; dial: string; water: number; battery: string | null;
  compatibility: string | null; warranty: string; caseSize: string; weight: number;
  colors: string[]; features: string[]; tags: string[];
  strapOptions?: string[];
  featured?: boolean; trending?: boolean; bestseller?: boolean; new?: boolean;
};

const products: SeedProduct[] = [
  { slug: "aether-one", name: "Aether One", model: "CL-A01", brand: "ChronoLux", category: "smart-watches", type: "SMART", gender: "UNISEX", price: 24990, compareAtPrice: 29990, stock: 18, desc: "A considered everyday smart watch with a vivid AMOLED face, quiet haptics and a precision-machined titanium case. Designed to move from early training sessions to late evenings without missing a beat.", display: "1.43-inch AMOLED", caseMaterial: "Grade 5 titanium", strap: "Fluoroelastomer", movement: "Digital", dial: "Obsidian", water: 100, battery: "Up to 12 days", compatibility: "iOS 16+ and Android 10+", warranty: "2 years", caseSize: "44 mm", weight: 48, colors: ["Graphite", "Stone", "Midnight"], strapOptions: ["Graphite fluoroelastomer", "Stone fluoroelastomer", "Midnight fluoroelastomer"], features: ["AMOLED display", "Dual-band GPS", "Heart rate and sleep tracking", "Bluetooth calling", "5 ATM water resistance"], tags: ["amoled", "gps", "fitness"], featured: true, trending: true, new: true },
  { slug: "nocturne-automatic", name: "Nocturne Automatic", model: "AW-611", brand: "Atelier No. 8", category: "automatic-watches", type: "AUTOMATIC", gender: "MEN", price: 68400, compareAtPrice: 76000, stock: 9, desc: "A quietly confident automatic built around a brushed steel case and a midnight sunray dial. The exhibition back reveals the rhythmic motion of its hand-finished rotor.", display: "Analog, sapphire crystal", caseMaterial: "316L stainless steel", strap: "Italian calf leather", movement: "Automatic, 40-hour reserve", dial: "Midnight blue", water: 50, battery: null, compatibility: null, warranty: "3 years", caseSize: "40 mm", weight: 72, colors: ["Ink", "Silver"], features: ["Sapphire crystal", "Exhibition case back", "Luminous hands", "100 m water resistance"], tags: ["automatic", "mechanical", "sapphire"], bestseller: true },
  { slug: "meridian-chronograph", name: "Meridian Chronograph", model: "MW-C02", brand: "Meridian Works", category: "chronograph-watches", type: "CHRONOGRAPH", gender: "MEN", price: 42800, compareAtPrice: 49900, stock: 12, desc: "A balanced chronograph with a tactile push-button action, crisp sub-dials and a tachymeter track. Engineered for legibility, finished for daily wear.", display: "Analog chronograph", caseMaterial: "316L stainless steel", strap: "Stainless steel bracelet", movement: "Quartz chronograph", dial: "Silver and charcoal", water: 100, battery: null, compatibility: null, warranty: "2 years", caseSize: "42 mm", weight: 139, colors: ["Steel", "Onyx"], features: ["1/10 second chronograph", "Tachymeter bezel", "Sapphire-coated glass", "10 ATM water resistance"], tags: ["chronograph", "sports", "steel"], trending: true },
  { slug: "solstice-mini", name: "Solstice Mini", model: "AV-220", brand: "Aster & Vale", category: "womens-watches", type: "ANALOG", gender: "WOMEN", price: 31800, compareAtPrice: null, stock: 7, desc: "A refined 30 mm silhouette with a warm champagne dial and slim polished markers. Solstice Mini brings a soft glow to a considered everyday uniform.", display: "Analog, mineral crystal", caseMaterial: "316L stainless steel", strap: "Milanese mesh", movement: "Japanese quartz", dial: "Champagne", water: 50, battery: null, compatibility: null, warranty: "2 years", caseSize: "30 mm", weight: 54, colors: ["Champagne", "Rose"], features: ["Slim mesh bracelet", "Quick-release strap", "Scratch-resistant crystal"], tags: ["dress", "mesh", "minimal"], new: true },
  { slug: "northline-trail-pro", name: "Trail Pro GPS", model: "NL-T9", brand: "Northline", category: "sports-watches", type: "SPORTS", gender: "UNISEX", price: 36900, compareAtPrice: 41900, stock: 23, desc: "A rugged GPS training companion with multi-sport profiles, route backtracking and a high-contrast transflective display built for bright trails.", display: "1.3-inch transflective MIP", caseMaterial: "Reinforced polymer", strap: "Silicone", movement: "Digital GPS", dial: "High-contrast black", water: 100, battery: "Up to 21 days, 48 hours GPS", compatibility: "iOS 16+ and Android 10+", warranty: "2 years", caseSize: "46 mm", weight: 57, colors: ["Moss", "Slate"], strapOptions: ["Moss silicone", "Slate silicone"], features: ["Multi-band GPS", "Barometer and compass", "Training readiness", "10 ATM water resistance", "Route backtracking"], tags: ["gps", "outdoor", "fitness"], featured: true },
  { slug: "forma-field-38", name: "Field 38", model: "FS-038", brand: "Forma Studio", category: "casual-watches", type: "CASUAL", gender: "UNISEX", price: 18900, compareAtPrice: 22900, stock: 31, desc: "A modern field watch with a sandblasted case, clear numerals and an easy-swapping canvas strap. Its compact proportions make it an effortless daily companion.", display: "Analog, sapphire-coated mineral", caseMaterial: "316L stainless steel", strap: "Recycled nylon", movement: "Japanese quartz", dial: "Warm white", water: 100, battery: null, compatibility: null, warranty: "2 years", caseSize: "38 mm", weight: 61, colors: ["Field green", "Black"], features: ["High-contrast dial", "Quick-release strap", "Luminous markers", "10 ATM water resistance"], tags: ["field", "casual", "nylon"], bestseller: true },
  { slug: "chronolux-atelier-tourbillon", name: "Atelier No. 1", model: "CL-AT1", brand: "ChronoLux", category: "luxury-watches", type: "LUXURY", gender: "MEN", price: 248000, compareAtPrice: 279000, stock: 3, desc: "A limited atelier series with a hand-wound movement, openworked balance and individually numbered case. Every surface is finished to reveal the care behind the mechanism.", display: "Openworked analog, sapphire", caseMaterial: "316L stainless steel", strap: "Hand-stitched leather", movement: "Hand-wound mechanical", dial: "Skeleton, anthracite", water: 50, battery: null, compatibility: null, warranty: "5 years", caseSize: "41 mm", weight: 88, colors: ["Graphite", "Silver"], features: ["Hand-wound movement", "Openworked balance", "Exhibition case back", "Individually numbered"], tags: ["luxury", "mechanical", "limited"], featured: true },
  { slug: "arc-digital-80", name: "Arc Digital 80", model: "CL-D80", brand: "ChronoLux", category: "digital-watches", type: "DIGITAL", gender: "KIDS", price: 4900, compareAtPrice: 5900, stock: 46, desc: "A clear, durable digital watch sized for smaller wrists, with a simple backlight, easy-to-read numerals and a soft-touch strap that is comfortable all day.", display: "Digital LCD with backlight", caseMaterial: "Resin", strap: "Soft-touch silicone", movement: "Digital quartz", dial: "LCD, black on light", water: 50, battery: "Up to 3 years", compatibility: null, warranty: "1 year", caseSize: "34 mm", weight: 31, colors: ["Ocean", "Coral"], features: ["Backlight", "Alarm and stopwatch", "Comfort-fit strap", "5 ATM water resistance"], tags: ["kids", "digital", "easy-read"] },
  { slug: "equinox-couple-set", name: "Equinox Pair", model: "AV-EQ2", brand: "Aster & Vale", category: "couple-watches", type: "COUPLE", gender: "COUPLES", price: 52900, compareAtPrice: 61900, stock: 8, desc: "Two complementary sunray dials, one shared design language. The 40 mm and 32 mm cases arrive together in a presentation box made for a thoughtful occasion.", display: "Analog, sapphire-coated mineral", caseMaterial: "316L stainless steel", strap: "Stainless steel bracelet", movement: "Japanese quartz", dial: "Silver sunray", water: 50, battery: null, compatibility: null, warranty: "2 years", caseSize: "40 mm and 32 mm", weight: 164, colors: ["Silver", "Two-tone"], features: ["Matched two-watch set", "Sapphire-coated crystal", "Adjustable bracelet", "Gift-ready presentation"], tags: ["couple", "gift", "pair"], featured: true },
  { slug: "meridian-mechanical-heritage", name: "Heritage 40", model: "MW-H40", brand: "Meridian Works", category: "mechanical-watches", type: "MECHANICAL", gender: "MEN", price: 79900, compareAtPrice: 89900, stock: 5, desc: "A hand-wound dress watch with a domed crystal, finely grained dial and slim profile. The visible movement turns a daily ritual into a moment of craft.", display: "Analog, domed sapphire", caseMaterial: "316L stainless steel", strap: "Italian leather", movement: "Hand-wound, 42-hour reserve", dial: "Forest green", water: 30, battery: null, compatibility: null, warranty: "3 years", caseSize: "40 mm", weight: 68, colors: ["Forest", "Burgundy"], features: ["Hand-wound movement", "Domed sapphire", "Display case back", "Slim 10 mm profile"], tags: ["mechanical", "dress", "heritage"], new: true },
  { slug: "northline-dive-300", name: "Dive 300", model: "NL-D300", brand: "Northline", category: "sports-watches", type: "SPORTS", gender: "MEN", price: 57900, compareAtPrice: 65900, stock: 14, desc: "A purpose-built diver with a unidirectional timing bezel, generous lume and a screw-down crown. Designed to stay legible and secure at depth.", display: "Analog, sapphire crystal", caseMaterial: "316L stainless steel", strap: "Tapered silicone", movement: "Japanese automatic", dial: "Deep ocean", water: 300, battery: null, compatibility: null, warranty: "3 years", caseSize: "42 mm", weight: 176, colors: ["Ocean", "Black"], features: ["300 m water resistance", "Unidirectional ceramic bezel", "Screw-down crown", "Super-LumiNova markers"], tags: ["diver", "automatic", "sports"], bestseller: true },
  { slug: "forma-sola-28", name: "Sola 28", model: "FS-S28", brand: "Forma Studio", category: "analog-watches", type: "ANALOG", gender: "WOMEN", price: 16400, compareAtPrice: 18900, stock: 16, desc: "A slim, minimal watch with a brushed oval dial and a fine-link bracelet. Sola is designed for intuitive styling and a barely-there feel.", display: "Analog, mineral crystal", caseMaterial: "316L stainless steel", strap: "Fine-link steel bracelet", movement: "Japanese quartz", dial: "Soft ivory", water: 30, battery: null, compatibility: null, warranty: "2 years", caseSize: "28 mm", weight: 42, colors: ["Silver", "Rose gold"], features: ["Slim 7 mm profile", "Adjustable bracelet", "Scratch-resistant mineral glass"], tags: ["women", "minimal", "analog"] },
  { slug: "chronolux-pulse-3", name: "Pulse 3", model: "CL-P03", brand: "ChronoLux", category: "smart-watches", type: "SMART", gender: "UNISEX", price: 17900, compareAtPrice: 21900, stock: 27, desc: "A light, intuitive smart watch that keeps health metrics and essentials close. The always-on display stays readable through commutes, workouts and the rest of the day.", display: "1.35-inch AMOLED always-on", caseMaterial: "Aluminium", strap: "Fluoroelastomer", movement: "Digital", dial: "AMOLED, customizable", water: 50, battery: "Up to 9 days", compatibility: "iOS 16+ and Android 10+", warranty: "2 years", caseSize: "42 mm", weight: 39, colors: ["Lilac", "Graphite"], strapOptions: ["Lilac fluoroelastomer", "Graphite fluoroelastomer"], features: ["Always-on AMOLED", "Heart rate and SpO2", "Sleep insights", "Bluetooth calling", "5 ATM water resistance"], tags: ["smart", "amoled", "wellness"], trending: true },
  { slug: "aster-moonphase-36", name: "Moonphase 36", model: "AV-M36", brand: "Aster & Vale", category: "luxury-watches", type: "LUXURY", gender: "WOMEN", price: 96400, compareAtPrice: 108000, stock: 4, desc: "A poetic moonphase complication sits above a mother-of-pearl dial, framed by a delicate polished bezel. A piece designed to be kept and passed on.", display: "Analog moonphase, sapphire", caseMaterial: "316L stainless steel", strap: "Italian leather", movement: "Swiss quartz moonphase", dial: "Mother of pearl", water: 50, battery: null, compatibility: null, warranty: "3 years", caseSize: "36 mm", weight: 63, colors: ["Pearl", "Midnight"], features: ["Moonphase indicator", "Sapphire crystal", "Mother-of-pearl dial", "Hand-finished markers"], tags: ["luxury", "moonphase", "pearl"] },
  { slug: "northline-kids-sprint", name: "Sprint Junior", model: "NL-JR1", brand: "Northline", category: "kids-watches", type: "DIGITAL", gender: "KIDS", price: 3900, compareAtPrice: 4500, stock: 38, desc: "A sturdy, lightweight watch with large digits, alarm and stopwatch controls designed for small hands. Easy to read, easy to wear and ready for playground adventures.", display: "Digital LCD with backlight", caseMaterial: "Recycled resin", strap: "Silicone", movement: "Digital quartz", dial: "High-contrast LCD", water: 100, battery: "Up to 2 years", compatibility: null, warranty: "1 year", caseSize: "32 mm", weight: 27, colors: ["Sky", "Lime"], features: ["Large easy-read digits", "Alarm and stopwatch", "10 ATM water resistance", "Impact-resistant case"], tags: ["kids", "sports", "digital"], new: true },
  { slug: "meridian-racer-chrono", name: "Racer Chrono", model: "MW-RC9", brand: "Meridian Works", category: "chronograph-watches", type: "CHRONOGRAPH", gender: "UNISEX", price: 34700, compareAtPrice: 39900, stock: 10, desc: "A compact motorsport-inspired chronograph with crisp contrasting sub-dials, a fixed tachymeter scale and a grippy crown for confident control.", display: "Analog chronograph", caseMaterial: "316L stainless steel", strap: "Perforated leather", movement: "Quartz chronograph", dial: "Warm white", water: 100, battery: null, compatibility: null, warranty: "2 years", caseSize: "40 mm", weight: 112, colors: ["Rally red", "Black"], features: ["60-minute chronograph", "Tachymeter scale", "Screw-lock crown", "10 ATM water resistance"], tags: ["chronograph", "motorsport", "racing"], trending: true },
  { slug: "forma-weekender", name: "Weekender 42", model: "FS-W42", brand: "Forma Studio", category: "casual-watches", type: "CASUAL", gender: "MEN", price: 11900, compareAtPrice: null, stock: 42, desc: "A clean, versatile three-hand watch with a soft-touch case and woven strap. Its pared-back dial keeps the essentials visible and the styling uncomplicated.", display: "Analog, mineral crystal", caseMaterial: "Aluminium", strap: "Woven recycled nylon", movement: "Japanese quartz", dial: "Matte black", water: 50, battery: null, compatibility: null, warranty: "2 years", caseSize: "42 mm", weight: 46, colors: ["Black", "Cobalt"], features: ["Lightweight case", "Quick-release woven strap", "Luminous hands"], tags: ["casual", "everyday", "lightweight"] },
  { slug: "chronolux-vertex-solar", name: "Vertex Solar", model: "CL-VS4", brand: "ChronoLux", category: "digital-watches", type: "DIGITAL", gender: "UNISEX", price: 12900, compareAtPrice: 14900, stock: 19, desc: "A solar-powered digital essential with a crisp memory LCD, dependable alarms and world-time support. A charge from daylight keeps the battery topped up.", display: "Memory LCD", caseMaterial: "Bio-based resin", strap: "Recycled TPU", movement: "Solar quartz digital", dial: "Always-on LCD", water: 100, battery: "Solar, up to 18 months reserve", compatibility: null, warranty: "2 years", caseSize: "40 mm", weight: 36, colors: ["Graphite", "Sage"], features: ["Solar charging", "World time", "Countdown timer and alarm", "10 ATM water resistance"], tags: ["solar", "digital", "sustainable"], bestseller: true },
  { slug: "aster-automatic-34", name: "Lune Automatic", model: "AV-L34", brand: "Aster & Vale", category: "automatic-watches", type: "AUTOMATIC", gender: "WOMEN", price: 72400, compareAtPrice: 82000, stock: 6, desc: "A compact automatic with a softly textured dial, slim applied indices and a smooth bracelet. The transparent case back reveals the motion within.", display: "Analog, sapphire crystal", caseMaterial: "316L stainless steel", strap: "Stainless steel bracelet", movement: "Automatic, 38-hour reserve", dial: "Blush silver", water: 50, battery: null, compatibility: null, warranty: "3 years", caseSize: "34 mm", weight: 86, colors: ["Blush", "Silver"], features: ["Automatic movement", "Sapphire crystal", "Exhibition case back", "Quick-release bracelet"], tags: ["automatic", "women", "craft"] },
  { slug: "northline-pace-lt", name: "Pace LT", model: "NL-P1", brand: "Northline", category: "sports-watches", type: "SPORTS", gender: "UNISEX", price: 22900, compareAtPrice: 26900, stock: 21, desc: "A streamlined running watch with precise GPS pace, structured training plans and a bright display. Light enough for long miles, capable enough for race day.", display: "1.2-inch transflective display", caseMaterial: "Reinforced polymer", strap: "Silicone", movement: "Digital GPS", dial: "High-contrast LCD", water: 50, battery: "Up to 14 days, 30 hours GPS", compatibility: "iOS 16+ and Android 10+", warranty: "2 years", caseSize: "42 mm", weight: 42, colors: ["Ice blue", "Black"], features: ["Multi-band GPS", "Training plans", "Recovery insights", "5 ATM water resistance"], tags: ["running", "gps", "sports"] },
  { slug: "atelier-classic-38", name: "Classic 38", model: "AN8-C38", brand: "Atelier No. 8", category: "mens-watches", type: "ANALOG", gender: "MEN", price: 28400, compareAtPrice: 32900, stock: 11, desc: "A slim three-hand classic with a guilloché-inspired dial and polished indices. It brings formal detail to a versatile profile that wears beautifully every day.", display: "Analog, sapphire-coated mineral", caseMaterial: "316L stainless steel", strap: "Italian calf leather", movement: "Japanese quartz", dial: "Warm silver", water: 50, battery: null, compatibility: null, warranty: "2 years", caseSize: "38 mm", weight: 58, colors: ["Silver", "Burgundy"], features: ["Slim 8.5 mm case", "Quick-release leather strap", "Sapphire-coated crystal"], tags: ["analog", "dress", "classic"] },
];

async function main() {
  for (const [name, slug, description] of categories) {
    await prisma.category.upsert({ where: { slug }, create: { name, slug, description }, update: { name, description } });
  }
  for (const [name, slug] of brands) {
    await prisma.brand.upsert({ where: { slug }, create: { name, slug }, update: { name } });
  }
  const categoryBySlug = new Map((await prisma.category.findMany()).map((category) => [category.slug, category.id]));
  const brandBySlug = new Map((await prisma.brand.findMany()).map((brand) => [brand.slug, brand.id]));

  for (const [index, product] of products.entries()) {
    const { brand, category, desc, display, strap, water, battery, compatibility, colors, strapOptions, features, tags, dial, weight, featured, trending, bestseller, new: isNew, ...fields } = product;
    const categoryId = categoryBySlug.get(category);
    const brandId = brandBySlug.get(brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    if (!categoryId || !brandId) throw new Error("Missing seed relation for " + product.slug);
    const images = [
      { url: "/watches/watch-" + String((index % 20) + 1).padStart(2, "0") + ".svg", alt: product.name + " watch, front view", sortOrder: 0 },
      { url: "/watches/watch-" + String(((index + 7) % 20) + 1).padStart(2, "0") + ".svg", alt: product.name + " watch, detail view", sortOrder: 1 },
    ];
    const data = {
      ...fields,
      description: desc,
      displayType: display,
      strapMaterial: strap,
      waterResistance: water,
      batteryLife: battery,
      compatibility,
      colorOptions: colors,
      strapOptions: strapOptions ?? [strap],
      dialColor: dial,
      weightGrams: weight,
      features,
      tags,
      isFeatured: Boolean(featured),
      isTrending: Boolean(trending),
      isBestSeller: Boolean(bestseller),
      isNewArrival: Boolean(isNew),
      brand: { connect: { id: brandId } },
      category: { connect: { id: categoryId } },
      specs: {
        Brand: brand, Model: product.model, "Watch type": product.type, "Display type": display,
        "Case material": product.caseMaterial, "Strap material": strap, Movement: product.movement,
        "Dial color": product.dial, "Case size": product.caseSize, "Water resistance": water + " m",
        "Battery life": battery ?? "Mechanical movement", Compatibility: compatibility ?? "Not applicable",
        Warranty: product.warranty, Weight: product.weight + " g",
      },
      images: { create: images },
    };
    await prisma.product.upsert({
      where: { slug: product.slug },
      create: data,
      update: { ...data, images: { deleteMany: {}, create: images } },
    });
  }
  console.log("Seeded " + products.length + " ChronoLux products, " + categories.length + " categories, and " + brands.length + " brands.");
}

main()
  .catch((error) => {
    console.error("ChronoLux seed failed:", error instanceof Error ? error.message : "unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
