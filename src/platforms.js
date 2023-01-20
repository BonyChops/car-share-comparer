const calcByTime = (config, base, plans) => {
    const r = [];
    let remainedMin = config?.時間料金;
    const plansWithActualMin = plans.map(v => ({
        ...v,
        actualMin: v.p / (base) * 15
    }))
    for (const plan of plansWithActualMin) {
        while (remainedMin / plan.m >= 1) {
            remainedMin -= plan.m;
            r.push([plan.name, plan.p]);
        }
        if (remainedMin >= plan.actualMin) {
            remainedMin -= plan.m;
            r.push([plan.name, plan.p]);
        }
    }
    if (remainedMin >= 0) {
        r.push(["基本料金", Math.ceil(remainedMin / 15) * (base)]);
    }

    return r;
}

const platforms = {
    "カーシェア・つくば": (config) => {
        const platformConfig = config?.platforms?.["カーシェア・つくば"] ?? {};
        const options = {
            車種: {
                k: "軽自動車",
                c: "コンパクト",
                m: "ミドル",
                s: "車中泊仕様"
            },
            初期費用: {
                t: "考慮する",
                f: "考慮しない"
            },
            免責補償: {
                t: "つける",
                f: "つけない"
            },
            "使用回数(初期費用を回数で割ります)": Object.fromEntries([...Array(10)].map((_, k) => [k, `${k + 1}回`]))
        };
        const calcEachConditions = () => {
            const buildDefault = (oneday, six = null) => {
                const r = [];
                r.push({ name: "24時間パック", p: oneday, m: 60 * 24 });
                if (six) {
                    r.push({ name: "8時間パック", p: six, m: 60 * 8 });
                }
                return r;
            };

            const plans = {
                k: calcByTime(config, 80, buildDefault(3880, 2120)),
                c: calcByTime(config, 100, buildDefault(4850, 2650)),
                m: calcByTime(config, 120, buildDefault(5820, 3180)),
                s: calcByTime(config, 260, buildDefault(12610)),
            };
            const resultByTime = plans[platformConfig.車種] ?? plans[Object.keys(plans)[0]];
            return [...resultByTime, ["距離料金", config.走行距離 * 15]];
        }
        const calc = calcEachConditions();
        const additionalCalc = [];
        if (platformConfig?.初期費用 !== "f") {
            additionalCalc.push(["月会費", 480]);

        }
        if (platformConfig?.免責補償 !== "f") {
            additionalCalc.push(["免責補償料", 1100 / ((platformConfig?.["使用回数(初期費用を回数で割ります)"] ?? 0) + 1)]);
        }
        const result = {
            options,
            backgroundColor: "#533691",
            calc: [
                ...Object.entries({
                    入会金: 0,
                }),
                ...additionalCalc,
                ...calc,
            ]
        };
        result.total = result.calc.reduce((acc, val) => acc + val[1], 0);
        return (result);
    },
    "TOYOTA SHARE": (config) => {
        const platformConfig = config?.platforms?.["TOYOTA SHARE"] ?? {};

        const options = {
            車種: {
                c: "コンパクトクラス",
                s: "スタンダードクラス",
                m: "ミドルクラス",
                l: "ラグジュアリークラス"
            },
            品質クラス: {
                c: "Casual",
                b: "Basic"
            },
            NOC無料プラン: {
                t: "つける",
                f: "つけない"
            }
        };

        const calcEachConditions = () => {
            const buildDefault = (six, twelve, oneday) => {
                const r = [];
                r.push({ name: "24時間パック", p: oneday, m: 60 * 24 });
                r.push({ name: "12時間パック", p: twelve, m: 60 * 12 });
                r.push({ name: "6時間パック", p: six, m: 60 * 6 });
                return r;
            };

            const plans = {
                c: {
                    c: calcByTime(config, 150, buildDefault(3080, 4270, 5511)),
                    b: calcByTime(config, 200, buildDefault(3800, 5300, 6800))
                },
                s: {
                    c: calcByTime(config, 200, buildDefault(3080, 4430, 5940)),
                    b: calcByTime(config, 250, buildDefault(3800, 5810, 7310))
                },
                m: {
                    c: calcByTime(config, 250, buildDefault(3080, 4650, 6320)),
                    b: calcByTime(config, 300, buildDefault(3800, 6300, 7800))
                },
                l: {
                    c: calcByTime(config, 350, buildDefault(6430, 7560, 9290)),
                    b: calcByTime(config, 400, buildDefault(6810, 8010, 9810))
                }
            };
            const resultByTime = plans[platformConfig?.車種]?.[platformConfig?.品質クラス] ?? plans[Object.keys(plans)[0]].c;
            if (config?.時間料金 >= 60 * 6) {
                resultByTime.push(["距離料金(約)", config.走行距離 * 15])
            }
            return [...resultByTime];
        }
        const calc = calcEachConditions();
        const additionalCalc = [];

        if (platformConfig?.NOC無料プラン !== "f") {
            additionalCalc.push(["NOC無料プラン", 330]);
        }

        const result = {
            options,
            backgroundColor: "#EB0A1D",
            calc: [
                ...Object.entries({
                    入会金: 0,
                    月会費: 0
                }),
                ...additionalCalc,
                ...calc,
            ]
        };
        result.total = result.calc.reduce((acc, val) => acc + val[1], 0)
        return (result);
    }
};

export default platforms;