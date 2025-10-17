import elCalcCSVURL from "./elCalcCSV.rls?url";
import elCalcOWLRDFURL from "./elCalcOWLRDF.rls?url";
import oldLimeTreesURL from "./oldLimeTrees.rls?url";
import divByZeroURL from "./div-by-zero.rls?url";
import findCommonAncestors from "./findCommonAncestors.rls?url";
import findCommonAncestorsWikidata from "./findCommonAncestorsWikidata.rls?url";
import wikipediaTitlesVsLabels from "./wikipediaTitlesVsLabels.rls?url";

export const listOfExamples: {
  name: string;
  url: string;
}[] = [
  {
    name: "Ancestors (basic)",
    url: findCommonAncestors,
  },
  {
    name: "Ancestors of Ada and Moby (Wikidata, SPARQL)",
    url: findCommonAncestorsWikidata,
  },
  {
    name: "Wikipedia articles vs. labels (Wikidata, RDF, string functions)",
    url: wikipediaTitlesVsLabels,
  },
  {
    name: "Old trees (CSV, Wikidata)",
    url: oldLimeTreesURL,
  },
  {
    name: "OWL EL Reasoning on preprocessed ontologies",
    url: elCalcCSVURL,
  },
  {
    name: "OWL EL Reasoning from OWL/RDF",
    url: elCalcOWLRDFURL,
  },
  {
    name: "Div by Zero Analysis (using pregenerated input files for a fixed Java Program)",
    url: divByZeroURL,
  },
];
