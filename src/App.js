import "./App.css";
import { useState } from "react";
import platforms from "./platforms";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

const range = (min, max, step = 1) =>
  Array.from({ length: (max - min + step) / step }, (v, k) => min + k * step);

// const logOutput = (data) => {
//   console.log(data);
//   return data;
// }

function App() {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    走行距離: {
      min: 0,
      init: 0,
      max: 300,
      postfix: "km",
    },
    時間料金: {
      min: 0,
      init: 0,
      max: 60 * 24,
      steps: 15,
      postfix: (m) => `分 (${m / 60}時間)`,
    },
  };

  const [config, setConfig] = useState(
    Object.fromEntries([
      ...Object.entries(options).map((v) => [v[0], v[1].init]),
      [
        "platforms",
        Object.fromEntries(Object.keys(platforms).map((v) => [v, {}])),
      ],
    ])
  );
  console.log(config);

  return (
    <div className="App">
      <h1>カーシェアプラットフォームを比較</h1>
      <table>
        {Object.entries(options).map((v) => (
          <tr>
            <td>{v[0]}</td>
            <td>
              <input
                type="range"
                width={100}
                step={v[1].steps ?? 1}
                value={config[v[0]]}
                onChange={(e) =>
                  setConfig((prevState, props) => ({
                    ...prevState,
                    [v[0]]: e.target.value,
                  }))
                }
                min={v[1].min}
                max={v[1].max}
              />
            </td>
            <td>{config[v[0]]}</td>
            <td>
              {((vv) => (typeof vv === "function" ? vv(config[v[0]]) : vv))(
                v[1]?.postfix
              )}
            </td>
          </tr>
        ))}
      </table>
      <h2>比較グラフ</h2>
      <select
        value={config.showGraph}
        onChange={(e) =>
          setConfig((prevState, props) => ({
            ...prevState,
            showGraph: e.target.value,
          }))
        }
      >
        <option value="none">なし</option>
        {Object.keys(options).map((v) => (
          <option value={v}>{v}</option>
        ))}
      </select>
      {config.showGraph && config.showGraph !== "none" && (
        <Line
          config={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "グラフタイトル",
              },
            },
          }}
          data={{
            labels: range(
              options[config.showGraph].min,
              options[config.showGraph].max,
              options[config.showGraph].steps
            ).map(
              (v) =>
                `${v}${((vv) => (typeof vv === "function" ? vv(v) : vv))(
                  options[config.showGraph]?.postfix
                )}`
            ),
            datasets: Object.entries(platforms).map((v) => ({
              label: v[0],
              data: range(
                options[config.showGraph].min,
                options[config.showGraph].max,
                options[config.showGraph].steps
              ).map((vv) => v[1]({ ...config, [config.showGraph]: vv }).total),
              backgroundColor: v[1](config).backgroundColor,
              borderColor: v[1](config).backgroundColor,
              pointStyle: false,
            })),
          }}
        />
      )}
      {Object.entries(platforms).map((v) => (
        <p>
          <h2>{v[0]}</h2>
          {Object.entries(v[1](config).options).map((vv) => (
            <div>
              {vv[0]}:{" "}
              <select
                value={config.platforms?.[v[0]]?.[vv[0]]}
                onChange={(e) =>
                  setConfig((p, _) => {
                    const pt = { ...p };
                    pt.platforms[v[0]][vv[0]] = e.target.value;
                    return pt;
                  })
                }
              >
                {Object.entries(vv[1]).map((v) => (
                  <option value={v[0]}>{v[1]}</option>
                ))}
              </select>
            </div>
          ))}
          <div style={{ display: "flex" }}>
            {v[1](config)?.calc?.map((vv) => (
              <div style={{ margin: "5px" }}>
                <p>{vv[0]}</p>
                <p>{vv[1]}</p>
              </div>
            ))}
            <div style={{ margin: "5px" }}>
              <p>合計</p>
              <p>{v[1](config)?.total}</p>
            </div>
          </div>
          {/* <pre>{JSON.stringify(v[1](config), null, 2)}</pre> */}
        </p>
      ))}
    </div>
  );
}

export default App;
