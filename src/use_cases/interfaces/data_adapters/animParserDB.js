export class animParserDB {
    static parseArray(animationAdapterArray) {
        const animations = {};

        Object.entries(animationAdapterArray).forEach((entry) => {
            const anim = entry[1];
            const name = anim.name;

            animations[name] = anim;
        });

        return animations;
    }
}
