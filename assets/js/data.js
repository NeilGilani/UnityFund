/*
  Unity Fund site data.

  Every page reads from this one file, so the allocation bar, the holdings
  tables, the calculator and the distribution chart always agree.

  NOTE: Organization names, weights and dollar figures below are sample
  content for the design. Replace them with the fund's real portfolio
  before launch. Sleeve weights must add up to 100, and the holding
  weights inside each sleeve must add up to that sleeve's weight.
*/
window.UNITY = {
  asOf: "September 30, 2026",

  facts: {
    distributedToDate: 16820000,
    firstYear: 2023,
    organizations: 39,
    causeAreas: 8,
    pooledThisQuarter: 2480000,
    currentQuarter: "Q3 2026",
    nextDistribution: "October 15, 2026",
    lastRebalance: "January 2026",
    minimumContribution: 10,
    contributors: 14200
  },

  // Cause areas ("sleeves"). The order is fixed: it sets each sleeve's chart
  // color, and the colors were checked for color-blind separation in this order.
  sleeves: [
    { id: "health",    name: "Global Health",              weight: 20, color: "#247448",
      summary: "Malaria prevention, maternal care, vaccines and primary care where treatment is scarce." },
    { id: "hunger",    name: "Hunger and Food Security",   weight: 15, color: "#B5812F",
      summary: "Food banks, school meals and support for small farms." },
    { id: "education", name: "Education",                  weight: 13, color: "#2A669F",
      summary: "Early literacy, teacher training and support for first-generation students." },
    { id: "economic",  name: "Economic Opportunity",       weight: 12, color: "#B3543C",
      summary: "Cash transfers, small business lending, apprenticeships and housing stability." },
    { id: "water",     name: "Clean Water and Sanitation", weight: 11, color: "#00919D",
      summary: "Wells, chlorination and sanitation for households, schools and clinics." },
    { id: "justice",   name: "Human Rights and Justice",   weight: 10, color: "#784784",
      summary: "Legal aid, refugee resettlement, reentry and child advocacy." },
    { id: "climate",   name: "Climate and Environment",    weight: 10, color: "#8A943F",
      summary: "Reforestation, clean cooking, wetlands and off-grid solar." },
    { id: "relief",    name: "Emergency Relief",           weight: 9,  color: "#B66277",
      summary: "Medical teams, shelter and safe water in the first weeks after a disaster." }
  ],

  holdings: [
    { name: "Meridian Malaria Consortium", sleeve: "health", weight: 4.5, since: 2023, region: "Sub-Saharan Africa",
      about: "Distributes insecticide-treated bed nets and seasonal malaria medicine." },
    { name: "Open Hands Maternal Health", sleeve: "health", weight: 3.8, since: 2023, region: "East Africa and South Asia",
      about: "Trains and equips midwives in rural clinics." },
    { name: "Vital Vaccine Access", sleeve: "health", weight: 3.4, since: 2023, region: "West Africa",
      about: "Funds cold storage, transport and outreach for routine childhood immunization." },
    { name: "Riverside Community Clinics", sleeve: "health", weight: 3.0, since: 2024, region: "United States",
      about: "Operates free primary care clinics for uninsured patients." },
    { name: "Clearsight Eye Health", sleeve: "health", weight: 2.8, since: 2024, region: "South Asia",
      about: "Provides cataract surgery and eyeglasses at low cost." },
    { name: "Beacon Tuberculosis Project", sleeve: "health", weight: 2.5, since: 2025, region: "Southeast Asia",
      about: "Finds and treats tuberculosis through community screening." },

    { name: "Harvest Table Food Network", sleeve: "hunger", weight: 4.0, since: 2023, region: "United States",
      about: "Supplies food banks and pantries across the rural Midwest and South." },
    { name: "Greenfield Smallholder Alliance", sleeve: "hunger", weight: 3.4, since: 2023, region: "East Africa",
      about: "Offers seed, training and market access to small farms." },
    { name: "School Meals Collective", sleeve: "hunger", weight: 3.0, since: 2024, region: "Latin America",
      about: "Serves a daily meal in public primary schools." },
    { name: "Second Helping Food Rescue", sleeve: "hunger", weight: 2.6, since: 2024, region: "United States",
      about: "Recovers surplus food from grocers and restaurants for shelters." },
    { name: "Common Pantry Project", sleeve: "hunger", weight: 2.0, since: 2026, region: "United States",
      about: "Runs client-choice pantries in high-need urban neighborhoods." },

    { name: "Brightpath Literacy", sleeve: "education", weight: 3.2, since: 2023, region: "United States",
      about: "Provides structured reading tutoring for children in grades one to three." },
    { name: "First Classroom Initiative", sleeve: "education", weight: 2.9, since: 2023, region: "South Asia",
      about: "Builds and staffs early childhood classrooms." },
    { name: "Scholars Bridge", sleeve: "education", weight: 2.6, since: 2024, region: "United States",
      about: "Supports first-generation college students through graduation." },
    { name: "Open Book Libraries", sleeve: "education", weight: 2.3, since: 2024, region: "Sub-Saharan Africa",
      about: "Stocks community libraries with books in local languages." },
    { name: "Teach Forward", sleeve: "education", weight: 2.0, since: 2025, region: "Latin America",
      about: "Trains public school teachers in proven classroom methods." },

    { name: "Direct Transfer Trust", sleeve: "economic", weight: 3.0, since: 2023, region: "East Africa",
      about: "Delivers unconditional cash transfers to households in extreme poverty." },
    { name: "Fairstart Microfinance", sleeve: "economic", weight: 2.8, since: 2023, region: "South Asia",
      about: "Makes small loans and savings accounts available to women entrepreneurs." },
    { name: "Workbridge Apprenticeships", sleeve: "economic", weight: 2.4, since: 2024, region: "United States",
      about: "Places adults in paid apprenticeships in the skilled trades." },
    { name: "Keystone Housing Partners", sleeve: "economic", weight: 2.1, since: 2025, region: "United States",
      about: "Helps low-income families secure and keep stable housing." },
    { name: "Main Street Enterprise Fund", sleeve: "economic", weight: 1.7, since: 2026, region: "United States",
      about: "Provides grants and coaching to small businesses in underserved towns." },

    { name: "Wellspring Water Trust", sleeve: "water", weight: 3.4, since: 2023, region: "Sub-Saharan Africa",
      about: "Drills and maintains community boreholes." },
    { name: "Clean Source Filtration", sleeve: "water", weight: 2.9, since: 2023, region: "East Africa",
      about: "Installs chlorine dispensers at village water points." },
    { name: "Blue Basin Sanitation", sleeve: "water", weight: 2.5, since: 2024, region: "South Asia",
      about: "Builds household and school latrines with local masons." },
    { name: "Rainline Water Systems", sleeve: "water", weight: 2.2, since: 2025, region: "Latin America",
      about: "Designs rainwater harvesting for schools and clinics." },

    { name: "Equal Counsel Legal Aid", sleeve: "justice", weight: 2.6, since: 2023, region: "United States",
      about: "Provides free civil legal representation to low-income tenants and families." },
    { name: "Safe Harbor Refugee Services", sleeve: "justice", weight: 2.3, since: 2023, region: "United States and Europe",
      about: "Resettles refugees and provides legal and language support." },
    { name: "Fair Record Reentry Project", sleeve: "justice", weight: 1.9, since: 2024, region: "United States",
      about: "Helps people leaving prison find work and housing." },
    { name: "Voices for Children Advocacy", sleeve: "justice", weight: 1.7, since: 2024, region: "United States",
      about: "Trains volunteer advocates for children in foster care." },
    { name: "Freedom From Trafficking Network", sleeve: "justice", weight: 1.5, since: 2025, region: "Southeast Asia",
      about: "Identifies and supports survivors of human trafficking." },

    { name: "Canopy Reforestation Trust", sleeve: "climate", weight: 2.6, since: 2023, region: "Latin America",
      about: "Restores degraded forest land with native species." },
    { name: "Cleanstove Collective", sleeve: "climate", weight: 2.2, since: 2023, region: "East Africa",
      about: "Replaces open cooking fires with efficient stoves." },
    { name: "Coastal Wetlands Alliance", sleeve: "climate", weight: 2.0, since: 2024, region: "Southeast Asia",
      about: "Protects and restores mangroves and coastal marshes." },
    { name: "Solar Villages Program", sleeve: "climate", weight: 1.8, since: 2025, region: "Sub-Saharan Africa",
      about: "Brings off-grid solar power to rural clinics and schools." },
    { name: "River Guardians", sleeve: "climate", weight: 1.4, since: 2026, region: "United States",
      about: "Monitors and cleans polluted rivers with local communities." },

    { name: "First Response Relief Corps", sleeve: "relief", weight: 2.8, since: 2023, region: "Global",
      about: "Deploys medical teams and supplies within 72 hours of a disaster." },
    { name: "Safe Shelter Emergency Fund", sleeve: "relief", weight: 2.3, since: 2023, region: "Global",
      about: "Provides tents, blankets and household kits after displacement." },
    { name: "Rapid Water Response", sleeve: "relief", weight: 2.1, since: 2024, region: "Global",
      about: "Restores safe drinking water after floods and earthquakes." },
    { name: "Afterstorm Recovery Network", sleeve: "relief", weight: 1.8, since: 2025, region: "United States and Caribbean",
      about: "Helps families rebuild homes after hurricanes and floods." }
  ],

  // Quarterly distributions, in US dollars. "paid" is the date grants were sent.
  distributions: [
    { quarter: "Q1", year: 2023, amount: 210000,  grants: 31, paid: "April 14, 2023" },
    { quarter: "Q2", year: 2023, amount: 340000,  grants: 31, paid: "July 14, 2023" },
    { quarter: "Q3", year: 2023, amount: 460000,  grants: 31, paid: "October 13, 2023" },
    { quarter: "Q4", year: 2023, amount: 880000,  grants: 31, paid: "January 12, 2024" },
    { quarter: "Q1", year: 2024, amount: 620000,  grants: 34, paid: "April 15, 2024" },
    { quarter: "Q2", year: 2024, amount: 790000,  grants: 34, paid: "July 15, 2024" },
    { quarter: "Q3", year: 2024, amount: 940000,  grants: 34, paid: "October 15, 2024" },
    { quarter: "Q4", year: 2024, amount: 1710000, grants: 34, paid: "January 15, 2025" },
    { quarter: "Q1", year: 2025, amount: 1180000, grants: 37, paid: "April 15, 2025" },
    { quarter: "Q2", year: 2025, amount: 1360000, grants: 37, paid: "July 15, 2025" },
    { quarter: "Q3", year: 2025, amount: 1520000, grants: 37, paid: "October 15, 2025" },
    { quarter: "Q4", year: 2025, amount: 2640000, grants: 37, paid: "January 15, 2026" },
    { quarter: "Q1", year: 2026, amount: 1960000, grants: 39, paid: "April 15, 2026" },
    { quarter: "Q2", year: 2026, amount: 2210000, grants: 39, paid: "July 15, 2026" }
  ],

  rebalance: {
    label: "January 2026",
    added: [
      { name: "Common Pantry Project", sleeve: "hunger",
        note: "Added to extend the food security sleeve into urban neighborhoods." },
      { name: "Main Street Enterprise Fund", sleeve: "economic",
        note: "Added after a two-year review of its small business grant outcomes." },
      { name: "River Guardians", sleeve: "climate",
        note: "Added as the fund's first domestic environmental holding." }
    ],
    removed: [
      { name: "Northgate Reading Fund", sleeve: "education",
        note: "Merged with Brightpath Literacy in 2025. Its programs continue under Brightpath." },
      { name: "Harborline Health Partners", sleeve: "health",
        note: "Did not deliver its 2024 audited financial statements within the required period." }
    ]
  }
};
