"""三联科研图：带置信带的曲线 / 带误差线与显著性标记的分组柱 / 带色条的热图。

用法（Agent 可原样执行）:
    python make_figure.py --out figure            # 输出 figure.svg / figure.pdf / figure.png
    换成自己的数据：改 demo_data() 的返回值即可（同样的形状）。

只依赖 numpy + matplotlib。样式全在 quiet.mplstyle 里，换期刊只改那一个文件。
"""
import argparse
import math
from pathlib import Path

import numpy as np
import matplotlib as mpl
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent
# 色盲友好的 Okabe–Ito 色板（Nature 系期刊常用）
OKABE_ITO = ["#0072B2", "#E69F00", "#009E73", "#D55E00", "#56B4E9", "#CC79A7", "#F0E442", "#000000"]
MM = 1 / 25.4  # 毫米 → 英寸


def demo_data(seed=7):
    rng = np.random.default_rng(seed)
    t = np.linspace(0, 10, 60)
    curves = {
        "Control": 1.0 + 0.05 * t + rng.normal(0, 0.05, (12, t.size)),
        "Treated": 1.0 + 0.18 * t - 0.008 * t ** 2 + rng.normal(0, 0.07, (12, t.size)),
    }
    groups = ["WT", "KO-1", "KO-2"]
    bars = {g: {"Control": rng.normal(m, 0.12, 8), "Treated": rng.normal(m * f, 0.15, 8)}
            for g, m, f in zip(groups, [1.0, 0.82, 0.76], [1.45, 1.12, 1.6])}
    heat = np.corrcoef(rng.normal(size=(9, 40)) + np.linspace(0, 2, 9)[:, None] * rng.normal(size=(1, 40)))
    return t, curves, groups, bars, heat


def stars(p):
    return "***" if p < 1e-3 else "**" if p < 1e-2 else "*" if p < 0.05 else "n.s."


def welch_p(a, b):
    """Welch 统计量的双侧 p 值，用正态近似（不依赖 scipy）。正式投稿请换成 scipy.stats.ttest_ind(equal_var=False)。"""
    va, vb = a.var(ddof=1) / a.size, b.var(ddof=1) / b.size
    z = abs(a.mean() - b.mean()) / np.sqrt(va + vb)
    return math.erfc(z / math.sqrt(2))


def panel_label(ax, s):
    ax.text(-0.18, 1.04, s, transform=ax.transAxes, fontsize=8, fontweight="bold", va="bottom")


def make(out: Path):
    plt.style.use(HERE / "quiet.mplstyle")
    t, curves, groups, bars, heat = demo_data()
    fig = plt.figure(figsize=(180 * MM, 62 * MM), constrained_layout=True)  # Nature 双栏宽 180mm
    gs = fig.add_gridspec(1, 3, width_ratios=[1.15, 1, 0.95])

    # a — 均值 ± 95% 置信带
    ax = fig.add_subplot(gs[0])
    for (name, y), c in zip(curves.items(), OKABE_ITO):
        m, se = y.mean(0), y.std(0, ddof=1) / np.sqrt(y.shape[0])
        ax.plot(t, m, color=c, lw=1.2, label=name)
        ax.fill_between(t, m - 1.96 * se, m + 1.96 * se, color=c, alpha=0.18, lw=0)
    ax.set(xlabel="Time (h)", ylabel="Normalised signal", xlim=(0, 10))
    ax.legend(frameon=False, loc="upper left", handlelength=1.2)
    panel_label(ax, "a")

    # b — 分组柱 + 散点 + 误差线 + 显著性
    ax = fig.add_subplot(gs[1])
    w = 0.36
    for gi, g in enumerate(groups):
        for ci, (cond, c) in enumerate(zip(["Control", "Treated"], OKABE_ITO)):
            v = bars[g][cond]; x = gi + (ci - 0.5) * w
            ax.bar(x, v.mean(), w * 0.92, color=c, alpha=0.85, lw=0, label=cond if gi == 0 else None)
            ax.errorbar(x, v.mean(), yerr=v.std(ddof=1), color="#222", lw=0.8, capsize=2, capthick=0.8)
            ax.scatter(np.full(v.size, x) + np.random.default_rng(gi * 2 + ci).uniform(-w * 0.22, w * 0.22, v.size), v,
                       s=4, color="white", edgecolor="#222", linewidth=0.4, zorder=3)
        a, b = bars[g]["Control"], bars[g]["Treated"]
        top = max(a.max(), b.max(), a.mean() + a.std(), b.mean() + b.std()) + 0.1
        ax.plot([gi - w / 2, gi - w / 2, gi + w / 2, gi + w / 2], [top - 0.04, top, top, top - 0.04], color="#222", lw=0.6)
        ax.text(gi, top + 0.01, stars(welch_p(a, b)), ha="center", va="bottom", fontsize=6)
    ax.set_xticks(range(len(groups)), groups)
    ax.set(ylabel="Relative expression", ylim=(0, None))
    ax.legend(frameon=False, loc="upper right", handlelength=1)
    panel_label(ax, "b")

    # c — 相关性热图（发散色板，0 居中）
    ax = fig.add_subplot(gs[2])
    im = ax.imshow(heat, cmap="RdBu_r", vmin=-1, vmax=1)
    ax.set_xticks(range(9), [f"G{i+1}" for i in range(9)], rotation=90)
    ax.set_yticks(range(9), [f"G{i+1}" for i in range(9)])
    ax.tick_params(length=0)
    for s in ax.spines.values(): s.set_visible(False)
    cb = fig.colorbar(im, ax=ax, shrink=0.8, ticks=[-1, 0, 1])
    cb.outline.set_visible(False); cb.set_label("Pearson r")
    panel_label(ax, "c")

    out.parent.mkdir(parents=True, exist_ok=True)
    for ext in ("svg", "pdf"):
        fig.savefig(out.with_suffix(f".{ext}"))
    fig.savefig(out.with_suffix(".png"), dpi=300)
    print("wrote", *(out.with_suffix(e) for e in (".svg", ".pdf", ".png")))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(HERE / "figure"))
    make(Path(ap.parse_args().out))
