import { useEffect, useRef } from "react";
import "./Evonne.css";

/*
// TODO: Remove
const exampleData = `
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
    <graph edgedefault="directed" id="0">
        <node id="0" subProofID="">
            <data key="type">axiom</data>
            <data key="element">Drone1 ⊑ SmallLargeDrone</data>
            <data key="mSElement">&lt;http://example-cd2#Drone1&gt; SubClassOf:
                &lt;http://example-cd2#SmallLargeDrone&gt;</data>
            <data key="nLElement">Everything that is "Drone1" is "SmallLargeDrone".</data>
            <data />
        </node>
        <node id="1">
            <data key="type">DLRule</data>
            <data key="element">Class Hierarchy</data>
        </node>
        <edge id="2" source="1" target="0" />
        <node id="3" subProofID="">
            <data key="type">axiom</data>
            <data key="element">Drone1 ⊑ ⊥</data>
            <data key="mSElement">&lt;http://example-cd2#Drone1&gt; SubClassOf: owl:Nothing</data>
            <data key="nLElement">Everything that is "Drone1" is "⊥".</data>
            <data />
        </node>
        <edge id="4" source="3" target="1" />
        <node id="5">
            <data key="type">DLRule</data>
            <data key="element">Class Hierarchy</data>
        </node>
        <edge id="6" source="5" target="3" />
        <node id="7" subProofID="">
            <data key="type">axiom</data>
            <data key="element">Drone1 ⊑ ∃locatedIn.SafeLocation</data>
            <data key="mSElement">&lt;http://example-cd2#Drone1&gt; SubClassOf:
                (&lt;http://example-cd2#locatedIn&gt; some &lt;http://example-cd2#SafeLocation&gt;)</data>
            <data key="nLElement">Everything that is "Drone1" "located" some "In" which is
                "SafeLocation".</data>
            <data />
        </node>
        <edge id="8" source="7" target="5" />
        <node id="9">
            <data key="type">DLRule</data>
            <data key="element">Asserted Conclusion</data>
        </node>
        <edge id="10" source="9" target="7" />
        <node id="11" subProofID="">
            <data key="type">axiom</data>
            <data key="element">∃locatedIn.SafeLocation ⊑ ∃locatedIn.⊥</data>
            <data key="mSElement">(&lt;http://example-cd2#locatedIn&gt; some
                &lt;http://example-cd2#SafeLocation&gt;) SubClassOf:
                (&lt;http://example-cd2#locatedIn&gt; some owl:Nothing)</data>
            <data key="nLElement">Everything that "located" some "In" which is "SafeLocation"
                "located" some "In" which is "⊥".</data>
            <data />
        </node>
        <edge id="12" source="11" target="5" />
        <node id="13">
            <data key="type">DLRule</data>
            <data key="element">Existential Filler Expansion</data>
        </node>
        <edge id="14" source="13" target="11" />
        <node id="15" subProofID="CDP1">
            <data key="type">axiom</data>
            <data key="element">SafeLocation ⊑ ⊥</data>
            <data key="mSElement">&lt;http://example-cd2#SafeLocation&gt; SubClassOf: owl:Nothing</data>
            <data key="nLElement">Everything that is "SafeLocation" is "⊥".</data>
            <data />
        </node>
        <edge id="16" source="15" target="13" />
        <node id="17">
            <data key="type">CDRule</data>
            <data key="element">[Constant too small]</data>
            <multiplication coefficient="Constant too small" nodeID="19" />
        </node>
        <edge id="18" source="17" target="15" />
        <node id="19" subProofID="CDP1">
            <data key="type">axiom</data>
            <data key="element">SafeLocation ⊑ Aux10</data>
            <data key="mSElement">&lt;http://example-cd2#SafeLocation&gt; SubClassOf: &lt;Aux10&gt;</data>
            <data key="nLElement">Everything that is "SafeLocation" is "Aux10".</data>
            <data>
                <entry id="20">
                    <key>Aux10</key>
                    <inequation id="21" type="equal">
                        <lhs id="22">
                            <term coe="1" var="&lt;http://example-cd2#sLDroneLocation&gt;" />
                        </lhs>
                        <rhs id="23">
                            <term con="8.0" />
                        </rhs>
                    </inequation>
                </entry>
            </data>
        </node>
        <edge id="24" source="19" target="17" />
        <node id="25">
            <data key="type">CDRule</data>
            <data key="element">[Propagate =]</data>
            <multiplication coefficient="Propagate =" nodeID="27" />
        </node>
        <edge id="26" source="25" target="19" />
        <node id="27" subProofID="">
            <data key="type">axiom</data>
            <data key="element">SafeLocation ⊑ Location</data>
            <data key="mSElement">&lt;http://example-cd2#SafeLocation&gt; SubClassOf:
                &lt;http://example-cd2#Location&gt;</data>
            <data key="nLElement">Everything that is "SafeLocation" is "Location".</data>
            <data>
                <entry id="28">
                    <key>Location</key>
                    <inequation id="29" type="equal">
                        <lhs id="30">
                            <term coe="1" var="&lt;http://example-cd2#location&gt;" />
                        </lhs>
                        <rhs id="31">
                            <term con="5.0" />
                        </rhs>
                    </inequation>
                </entry>
            </data>
        </node>
        <edge id="32" source="27" target="25" />
        <node id="33">
            <data key="type">DLRule</data>
            <data key="element">Asserted Conclusion</data>
        </node>
        <edge id="34" source="33" target="27" />
        <node id="35" subProofID="CDP1">
            <data key="type">axiom</data>
            <data key="element">SafeLocation ⊑ Aux2</data>
            <data key="mSElement">&lt;http://example-cd2#SafeLocation&gt; SubClassOf: &lt;Aux2&gt;</data>
            <data key="nLElement">Everything that is "SafeLocation" is "Aux2".</data>
            <data>
                <entry id="36">
                    <key>Aux2</key>
                    <inequation id="37" type="plus">
                        <lhs id="38">
                            <term coe="1" var="&lt;http://example-cd2#location&gt;" />
                            <term con="3.0" />
                        </lhs>
                        <rhs id="39">
                            <term coe="1" var="&lt;http://example-cd2#sLDroneLocation&gt;" />
                        </rhs>
                    </inequation>
                </entry>
            </data>
        </node>
        <edge id="40" source="35" target="25" />
        <node id="41">
            <data key="type">CDRule</data>
            <data key="element">[Sum of differences]</data>
            <multiplication coefficient="Sum of differences" nodeID="43" />
        </node>
        <edge id="42" source="41" target="35" />
        <node id="43" subProofID="">
            <data key="type">axiom</data>
            <data key="element">SafeLocation ⊑ SafeSmallDroneLocation</data>
            <data key="mSElement">&lt;http://example-cd2#SafeLocation&gt; SubClassOf:
                &lt;http://example-cd2#SafeSmallDroneLocation&gt;</data>
            <data key="nLElement">Everything that is "SafeLocation" is "SafeSmallDroneLocation".</data>
            <data>
                <entry id="44">
                    <key>SafeSmallDroneLocation</key>
                    <inequation id="45" type="plus">
                        <lhs id="46">
                            <term coe="1" var="&lt;http://example-cd2#location&gt;" />
                            <term con="1.0" />
                        </lhs>
                        <rhs id="47">
                            <term coe="1" var="&lt;http://example-cd2#sSDroneLocation&gt;" />
                        </rhs>
                    </inequation>
                </entry>
            </data>
        </node>
        <edge id="48" source="43" target="41" />
        <node id="49">
            <data key="type">DLRule</data>
            <data key="element">Asserted Conclusion</data>
        </node>
        <edge id="50" source="49" target="43" />
        <node id="51" subProofID="">
            <data key="type">axiom</data>
            <data key="element">SafeLocation ⊑ SafeLargeDroneLocation</data>
            <data key="mSElement">&lt;http://example-cd2#SafeLocation&gt; SubClassOf:
                &lt;http://example-cd2#SafeLargeDroneLocation&gt;</data>
            <data key="nLElement">Everything that is "SafeLocation" is "SafeLargeDroneLocation".</data>
            <data>
                <entry id="52">
                    <key>SafeLargeDroneLocation</key>
                    <inequation id="53" type="plus">
                        <lhs id="54">
                            <term coe="1" var="&lt;http://example-cd2#sSDroneLocation&gt;" />
                            <term con="2.0" />
                        </lhs>
                        <rhs id="55">
                            <term coe="1" var="&lt;http://example-cd2#sLDroneLocation&gt;" />
                        </rhs>
                    </inequation>
                </entry>
            </data>
        </node>
        <edge id="56" source="51" target="41" />
        <node id="57">
            <data key="type">DLRule</data>
            <data key="element">Asserted Conclusion</data>
        </node>
        <edge id="58" source="57" target="51" />
        <node id="59" subProofID="">
            <data key="type">axiom</data>
            <data key="element">SafeLocation ⊑ SafeLargeDroneLocationMinimum</data>
            <data key="mSElement">&lt;http://example-cd2#SafeLocation&gt; SubClassOf:
                &lt;http://example-cd2#SafeLargeDroneLocationMinimum&gt;</data>
            <data key="nLElement">Everything that is "SafeLocation" is
                "SafeLargeDroneLocationMinimum".</data>
            <data>
                <entry id="60">
                    <key>SafeLargeDroneLocationMinimum</key>
                    <inequation id="61" type="greaterThan">
                        <lhs id="62">
                            <term coe="1" var="&lt;http://example-cd2#sLDroneLocation&gt;" />
                        </lhs>
                        <rhs id="63">
                            <term con="10.0" />
                        </rhs>
                    </inequation>
                </entry>
            </data>
        </node>
        <edge id="64" source="59" target="17" />
        <node id="65">
            <data key="type">DLRule</data>
            <data key="element">Asserted Conclusion</data>
        </node>
        <edge id="66" source="65" target="59" />
        <node id="67" subProofID="">
            <data key="type">axiom</data>
            <data key="element">∃locatedIn.⊥ ⊑ ⊥</data>
            <data key="mSElement">(&lt;http://example-cd2#locatedIn&gt; some owl:Nothing)
                SubClassOf: owl:Nothing</data>
            <data key="nLElement">Everything that "located" some "In" which is "⊥" is "⊥".</data>
            <data />
        </node>
        <edge id="68" source="67" target="5" />
        <node id="69">
            <data key="type">DLRule</data>
            <data key="element">Existential of Bottom</data>
        </node>
        <edge id="70" source="69" target="67" />
        <node id="71" subProofID="">
            <data key="type">axiom</data>
            <data key="element">⊥ ⊑ SmallLargeDrone</data>
            <data key="mSElement">owl:Nothing SubClassOf: &lt;http://example-cd2#SmallLargeDrone&gt;</data>
            <data key="nLElement">Everything that is "⊥" is "SmallLargeDrone".</data>
            <data />
        </node>
        <edge id="72" source="71" target="1" />
        <node id="73">
            <data key="type">DLRule</data>
            <data key="element">Bottom Subclass</data>
        </node>
        <edge id="74" source="73" target="71" />
    </graph>
</graphml>
`;
*/

export interface EvonneProps {
  data: string;
}

export function Evonne({ data }: EvonneProps) {
  const evonneFrame = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.source !== evonneFrame.current?.contentWindow) {
        return;
      }

      evonneFrame.current!.contentWindow!.postMessage(
        {
          command: "show",
          data,
        },
        "*",
      );
    };
    window.addEventListener("message", listener);

    return () => window.removeEventListener("message", listener);
  });

  return (
    <iframe
      ref={evonneFrame}
      className="evonne-iframe"
      src="/evonne.html"
      sandbox="allow-scripts"
    />
  );
}
