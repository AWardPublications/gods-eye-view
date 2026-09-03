# Authoritative Claims Reference: WO/2026/150385 (PCT/IE2025/050001)

**TITLE OF INVENTION**: System and Method for Performance-Adaptive Golf Coaching and Content Generation  
**APPLICANT / INVENTOR**: David Ward (A. Ward Publications / Brehon AI Solutions Ltd.)  
**SUBMISSION TYPE**: Amendments under Article 19 (PCT)  
**DATE OF SUBMISSION**: 23 April 2026 (Sion, Switzerland)  
**INTERNATIONAL BUREAU**: WIPO  

---

## Replacement Claim Set (Claims 1–9)

### Claim 1 (Independent System Claim)
A computer-implemented system for generating adaptive user-specific output based on natural-language interaction data, the system comprising:
* a user interface configured to receive natural-language input and provide corresponding output;
* an input processing module configured to:
  1. extract one or more semantic features from the natural-language input using a predefined rule set and/or a trained language model; and
  2. generate a structured input representation comprising at least an intent indicator and a linguistic state indicator;
* a persistent memory architecture configured to:
  1. store a plurality of session records, each session record comprising the structured input representation and associated contextual metadata; and
  2. enable retrieval of said session records based on temporal and contextual indices;
* an evaluation module configured to:
  1. compare the structured input representation of a current session with one or more stored session records; and
  2. determine at least one behavioural deviation metric representing a change in user interaction characteristics over multiple sessions;
* a routing module configured to:
  1. receive the behavioural deviation metric and the structured input representation; and
  2. select a processing pathway from a plurality of predefined processing pathways based on a deterministic decision logic applied to said metric and representation;
* an output generation module configured to generate a response based on the selected processing pathway; and
* an output control module configured to modify one or more output parameters, including at least output format, linguistic complexity, or tonal characteristic, based on the behavioural deviation metric,
* **wherein** the input processing module, persistent memory architecture, evaluation module, routing module, output generation module, and output control module are operatively connected via the persistent memory architecture such that system output is controlled by longitudinal evaluation of stored interaction data derived solely from natural-language input.

---

### Claim 2
The system of claim 1, wherein the deterministic decision logic of the routing module is configured to:
1. assign a processing priority to the structured input representation based on contextual metadata associated with the current session;
2. evaluate the behavioural deviation metric relative to one or more baseline interaction patterns derived from stored session records; and
3. route the structured input representation to a supervisory processing pathway when the behavioural deviation metric satisfies a predefined deviation condition over a plurality of sessions,
* **wherein** the supervisory processing pathway is configured to generate an alternative output profile differing in at least one of response structure, delivery modality, or linguistic framing relative to a default processing pathway.

---

### Claim 3
The system of claim 1 or 2, wherein the persistent memory architecture employs a schema in which each session entry comprises structured conversational metadata, inferred mood vectors, and compliance scores, and said entries are indexed by timestamp and domain type to enable retrieval within real-time latency constraints.

---

### Claim 4
The system of any preceding claim, wherein the content generation module formats coaching feedback using:
1. rule-based performance classification derived from engagement trends and user preferences;
2. template selection guided by historical tone-response patterns; and
3. a real-time adaptation mechanism which, upon detecting:
   * (i) sustained indication of reduced user engagement over multiple interactions; and
   * (ii) system responses may be conditionally activated when changes in user interaction patterns are detected across multiple sessions,
* causes the system to:
  * (i) reduce feedback length;
  * (ii) default to audio-only summaries; and
  * (iii) shift to a supportive or neutral tone.

---

### Claim 5
The system of any preceding claim, wherein an analytics agent is configured to detect engagement drift by identifying:
1. a reduction in session frequency exceeding a statistical deviation from baseline;
2. sustained indication of reduced user engagement over multiple interactions; or
3. system responses conditionally activated when changes in user interaction patterns are detected across multiple sessions,
* based on metrics stored in the memory architecture.

---

### Claim 6
The system of any preceding claim, wherein at least one NLP agent module is configured to combine historical compliance and session outcome records, inferred emotional state, and session context to generate a personalized coaching output, and wherein said adaptation includes modifying:
1. response length and pacing;
2. instructional complexity; and
3. tonal framing,
* based on memory-derived sentiment and compliance scores evaluated using rolling statistical averages over multiple sessions.

---

### Claim 7
The system of any preceding claim, wherein tone modulation is activated only when either:
1. the sentiment polarity score of the current session is below a defined threshold; or
2. the compliance score is below a defined threshold,
* and in both cases the respective value deviates by a statistical deviation from baseline.

---

### Claim 8
The system of any preceding claim, wherein tone recovery is triggered when the sentiment polarity returns within a defined range of the user's baseline, and wherein tone decay is enforced if deviation persists for more than a defined number of interactions, causing the system to gradually transition tone toward a neutral state.

---

### Claim 9
The system of any preceding claim, wherein a compliance score is generated from user natural-language input by a machine learning classifier trained to detect task adherence and avoidance patterns, the resulting score being stored in the persistent memory architecture alongside session metadata and emotional state tags; wherein system agents utilize said compliance score to:
1. adapt coaching output;
2. initiate tone modulation if deviation exceeds a statistical threshold; or
3. trigger escalation behaviors if the score remains below a defined threshold across multiple sessions,
* **without reliance on biometric or sensor data**.
