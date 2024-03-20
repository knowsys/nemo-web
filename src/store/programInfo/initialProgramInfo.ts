import { ProgramInfo } from "./ProgramInfo";

export const initialProgramInfo: ProgramInfo = {
  programText: `% This example finds trees of (some species of lime/linden tree) in Dresden,
% which are more than 200 years old.
% 
% It shows how to load (typed) data from (compressed) CSV files, how to
% perform a recursive reachability query, and how to use datatype built-in to
% find old trees. It can be modified to use a different species or genus of
% plant, and by changing the required age.

@import tree :- csv{format=(string, string, int, int), resource="https://raw.githubusercontent.com/knowsys/nemo-examples/main/examples/lime-trees/dresden-trees-ages-heights.csv"} . % location URL, species, age, height in m
@import taxon :- csv{format=(string, string, string), resource="https://raw.githubusercontent.com/knowsys/nemo-examples/main/examples/lime-trees/wikidata-taxon-name-parent.csv.gz"} . % location URL, species, age, height in m

limeSpecies(?X, "Tilia") :- taxon(?X, "Tilia", ?P).
limeSpecies(?X, ?Name) :- taxon(?X, ?Name, ?Y), limeSpecies(?Y, ?N).

oldLime(?location,?species,?age) :- tree(?location,?species,?age,?heightInMeters), ?age > 200, limeSpecies(?id,?species) .

@output oldLime.
`,
};
