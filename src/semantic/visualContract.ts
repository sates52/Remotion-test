import type { NarrativeAtom } from "./narrativeAtom.ts";

export interface VisualContract {
  sceneId: string;
  narrationClaim: string;
  semanticCore: string;
  mustShow: string[];
  shouldShow: string[];
  mustNotShow: string[];
}

export interface VisualEvaluation {
  subjectMatch: number;              // 0 - 1
  actionMatch: number;               // 0 - 1
  relationshipMatch: number;         // 0 - 1
  contextMatch: number;              // 0 - 1
  contradiction: number;             // 0 - 1 (1.0 = direct emotional/semantic contradiction)
  genericAssociationPenalty: number; // 0 - 1 (1.0 = lazy corporate/self-help template)
  finalScore: number;                // 0 - 100
  verdict: "PASS" | "REJECT";
  violations: string[];
  reasons: string[];
}

const FORBIDDEN_GENERIC_TEXTS = new Set([
  "CRITICAL DISTINCTION",
  "SYSTEM 1 VS SYSTEM 2",
  "THE 99% DEFAULT",
  "DOPAMINE LOOP",
  "1% COMPOUND",
  "CAREER LEVERAGE",
  "TASK FRICTION",
  "THE PASSENGER SEAT",
  "NO REAL",
  "BY THE REAL"
]);

/**
 * Creates a rigorous VisualContract from a NarrativeAtom.
 */
export function createVisualContractFromAtom(
  atom: NarrativeAtom,
  sceneId: string,
  extraForbidden?: string[]
): VisualContract {
  const mustShow: string[] = [];
  const shouldShow: string[] = [];
  const mustNotShow: string[] = [
    ...(extraForbidden || [])
  ];

  if (atom.subject) mustShow.push(atom.subject.toLowerCase());
  if (atom.object) shouldShow.push(atom.object.toLowerCase());

  // Add semantic core
  const semanticCore = atom.relationship || atom.action || atom.concepts.join(", ");

  // Derive negative constraints (mustNotShow) based on narrative context
  const textLower = atom.text.toLowerCase();
  const isTragicOrViolent = /\b(war|veteran|trauma|shatters|dead|corpse|murder|atomic|nuclear|starved|crash|wreckage|screaming)\b/i.test(textLower);

  if (isTragicOrViolent) {
    mustNotShow.push("heart", "celebrate", "happy", "party", "corporate_badge");
  }

  // Fiction / Literature specific constraints
  mustNotShow.push("CRITICAL DISTINCTION", "SYSTEM 1 VS SYSTEM 2", "THE 99% DEFAULT");

  return {
    sceneId,
    narrationClaim: atom.text.trim(),
    semanticCore,
    mustShow,
    shouldShow,
    mustNotShow
  };
}

/**
 * Visual Contract Gate Evaluator:
 * Strictly assesses whether the rendered scene satisfies the contract.
 * Enforces: Topic association != Semantic match.
 */
export function evaluateSceneVisualContract(
  scene: any,
  contract: VisualContract
): VisualEvaluation {
  const violations: string[] = [];
  const reasons: string[] = [];

  const characters = Array.isArray(scene.characters) ? scene.characters : [];
  const props = Array.isArray(scene.props) ? scene.props : [];
  const texts = Array.isArray(scene.texts) ? scene.texts : [];
  const bgSet = (scene.bg && scene.bg.set) || "default";

  // 1. Check mustNotShow violations
  for (const p of props) {
    if (contract.mustNotShow.some(m => m.toLowerCase() === (p.type || "").toLowerCase())) {
      violations.push(`FORBIDDEN_PROP: Prop '${p.type}' is strictly forbidden for this narrative beat`);
    }
  }

  for (const t of texts) {
    const rawText = (t.text || "").toUpperCase().trim();
    if (FORBIDDEN_GENERIC_TEXTS.has(rawText)) {
      violations.push(`GENERIC_TEMPLATE_TEXT: Detected banned template callout '${rawText}'`);
    }
  }

  // 2. Contradiction Analysis
  let contradiction = 0.0;
  const isDarkBeat = /\b(war|veteran|scarred|dead|kill|atomic|nuclear|shatter|monster|ruin|tragedy|corrupt|blood)\b/i.test(contract.narrationClaim);

  for (const c of characters) {
    const expr = (c.expression || "").toLowerCase();
    const action = (c.action || "").toLowerCase();

    if (isDarkBeat && (expr === "happy" || action === "celebrate")) {
      contradiction = Math.max(contradiction, 0.9);
      violations.push(`EMOTIONAL_CONTRADICTION: Character '${c.role || c.id}' is ${expr}/${action} during a dark/tragic narrative beat`);
    }
  }

  // 3. Generic Association Penalty
  let genericAssociationPenalty = 0.0;
  for (const t of texts) {
    const upper = (t.text || "").toUpperCase().trim();
    if (FORBIDDEN_GENERIC_TEXTS.has(upper)) {
      genericAssociationPenalty = Math.max(genericAssociationPenalty, 0.85);
    }
  }

  // Check for lazy icon combinations (e.g. war -> arrow -> heart)
  const propTypes = props.map((p: any) => (p.type || "").toLowerCase());
  if (propTypes.includes("war") && propTypes.includes("heart")) {
    genericAssociationPenalty = Math.max(genericAssociationPenalty, 0.95);
    violations.push("LAZY_ICON_COMBINATION: Detected clichéd 'war -> heart' icon juxtaposition over serious trauma beat");
  }

  // 4. Subject Match (0.0 - 1.0)
  let subjectMatch = 0.4; // baseline neutral
  const textClaim = contract.narrationClaim.toLowerCase();

  const hasGoldingMention = textClaim.includes("golding");
  const hasJackMention = textClaim.includes("jack");
  const hasPiggyMention = textClaim.includes("piggy");
  const hasRalphMention = textClaim.includes("ralph");
  const hasKingMention = textClaim.includes("stephen king") || textClaim.includes("king");

  const charRoles = characters.map((c: any) => (c.role || c.id || "").toLowerCase());

  if (hasGoldingMention && charRoles.includes("golding")) subjectMatch += 0.4;
  if (hasKingMention && charRoles.includes("king")) subjectMatch += 0.4;
  if (hasJackMention && charRoles.includes("jack")) subjectMatch += 0.4;
  if (hasPiggyMention && charRoles.includes("piggy")) subjectMatch += 0.4;
  if (hasRalphMention && charRoles.includes("ralph")) subjectMatch += 0.4;

  // Missing named subject penalty
  if (hasPiggyMention && !charRoles.includes("piggy") && characters.length > 0) {
    subjectMatch = Math.min(subjectMatch, 0.2);
    violations.push("MISSING_PRIMARY_CHARACTER: Piggy is explicitly mentioned but absent on screen");
  }
  if (hasRalphMention && !charRoles.includes("ralph") && characters.length > 0) {
    subjectMatch = Math.min(subjectMatch, 0.2);
    violations.push("MISSING_PRIMARY_CHARACTER: Ralph is explicitly mentioned but absent on screen");
  }

  subjectMatch = Math.max(0.0, Math.min(1.0, subjectMatch));

  // 5. Action Match (0.0 - 1.0)
  let actionMatch = 0.5;
  const isPhysicalAction = /\b(steps onto|marches|shot down|crashes|seized|dragged|murders|disarm)\b/i.test(textClaim);
  const isJustTalking = characters.every((c: any) => c.action === "talk" || c.action === "idle");

  if (isPhysicalAction && isJustTalking) {
    actionMatch = 0.2;
    reasons.push("Narration describes dramatic physical action, but on screen characters are passively talking/idling");
  } else if (!isPhysicalAction && isJustTalking) {
    actionMatch = 0.7;
  } else if (characters.some((c: any) => c.action === "point" || c.action === "gesture")) {
    actionMatch = 0.6;
  }

  // 6. Relationship Match (0.0 - 1.0)
  let relationshipMatch = 0.5;
  if (propTypes.includes("heart") && textClaim.includes("veteran")) {
    relationshipMatch = 0.1; // Complete narrative disconnect
  }

  // 7. Context Match (0.0 - 1.0)
  let contextMatch = 0.5;
  if (textClaim.includes("beach") || textClaim.includes("island") || textClaim.includes("jungle")) {
    if (bgSet === "shipDeck") {
      contextMatch = 0.2;
      violations.push("SETTING_MISMATCH: Island/beach/jungle narration is staged inside 'shipDeck'");
    } else {
      contextMatch = 0.8;
    }
  }

  // Calculate Final Score (0 - 100)
  const positiveBase = (subjectMatch * 30) + (actionMatch * 25) + (relationshipMatch * 25) + (contextMatch * 20);
  const contradictionFactor = (1.0 - (contradiction * 0.75));
  const penalty = genericAssociationPenalty * 40;

  let finalScore = Math.round((positiveBase * contradictionFactor) - penalty);
  finalScore = Math.max(0, Math.min(100, finalScore));

  const verdict: "PASS" | "REJECT" = 
    (finalScore >= 60 && contradiction < 0.5 && violations.length === 0) ? "PASS" : "REJECT";

  return {
    subjectMatch: Number(subjectMatch.toFixed(2)),
    actionMatch: Number(actionMatch.toFixed(2)),
    relationshipMatch: Number(relationshipMatch.toFixed(2)),
    contextMatch: Number(contextMatch.toFixed(2)),
    contradiction: Number(contradiction.toFixed(2)),
    genericAssociationPenalty: Number(genericAssociationPenalty.toFixed(2)),
    finalScore,
    verdict,
    violations,
    reasons
  };
}
