import DetectionMode from "./base.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * The detection mode for Divine Sense.
 */
export default class DetectionModeDivineSense extends DetectionMode {
    constructor() {
        super({
            id: "divineSense",
            label: "VISION5E.DivineSense",
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: false,
            angle: false,
            important: true,
            imprecise: true,
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.detectEvilAndGood.constructor.getDetectionFilter();
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (!(target instanceof Token)
            || !target.actor?.system.details?.type
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.OBJECT)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)) {
            return false;
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEPING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.REVENANCE)) {
            return true;
        }

        const creatureType = target.actor.system.details.type.value;

        return creatureType === "celestial"
            || creatureType === "fiend"
            || creatureType === "undead";
    }

    /** @override */
    _testLOS(visionSource, mode, target, test) {
        return !(this.walls && CONFIG.Canvas.polygonBackends.sight.testCollision(
            visionSource.origin,
            test.point,
            {
                type: "sight",
                mode: "any",
                source: visionSource,
                useThreshold: true,
                priority: Infinity,
            },
        ));
    }
}
