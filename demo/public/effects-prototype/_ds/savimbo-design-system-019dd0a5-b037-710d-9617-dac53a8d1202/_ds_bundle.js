/* @ds-bundle: {"format":3,"namespace":"SavimboDesignSystem_019dd0","components":[],"sourceHashes":{"ui_kits/website/BuyForm.jsx":"2de9a7814a8b","ui_kits/website/Footer.jsx":"cad8441ad3a2","ui_kits/website/Header.jsx":"65ce2704454e","ui_kits/website/Hero.jsx":"b11a69614e33","ui_kits/website/MethodologySteps.jsx":"bbd66044db3f","ui_kits/website/ProjectCard.jsx":"64ef724344fb","ui_kits/website/StatStrip.jsx":"d81085c256ba"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SavimboDesignSystem_019dd0 = window.SavimboDesignSystem_019dd0 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/website/BuyForm.jsx
try { (() => {
// BuyForm.jsx — buy credits flow (mocked). Swiss-register form on white,
// single Folly-pink submit at the bottom.

const BuyForm = ({
  onComplete
}) => {
  const [kind, setKind] = React.useState("carbon");
  const [qty, setQty] = React.useState(120);
  const [email, setEmail] = React.useState("");
  const pricePer = {
    carbon: 18,
    biodiversity: 24,
    water: 22,
    reforestation: 16
  }[kind];
  const total = pricePer * qty;
  const submit = e => {
    e.preventDefault();
    onComplete?.({
      kind,
      qty,
      email,
      total
    });
  };
  return /*#__PURE__*/React.createElement("section", {
    style: buyStyles.section
  }, /*#__PURE__*/React.createElement("span", {
    style: buyStyles.eyebrow
  }, "Buy credits"), /*#__PURE__*/React.createElement("h2", {
    style: buyStyles.h2
  }, "Direct from the families who grow them."), /*#__PURE__*/React.createElement("form", {
    style: buyStyles.form,
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("div", {
    style: buyStyles.field
  }, /*#__PURE__*/React.createElement("label", {
    style: buyStyles.label
  }, "Credit type"), /*#__PURE__*/React.createElement("div", {
    style: buyStyles.radios
  }, [["carbon", "Carbon"], ["biodiversity", "Biodiversity"], ["water", "Water"], ["reforestation", "Reforestation"]].map(([id, lbl]) => /*#__PURE__*/React.createElement("label", {
    key: id,
    style: {
      ...buyStyles.radio,
      ...(kind === id ? buyStyles.radioOn : {})
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "kind",
    checked: kind === id,
    onChange: () => setKind(id),
    style: {
      accentColor: "var(--sv-folly)"
    }
  }), lbl)))), /*#__PURE__*/React.createElement("div", {
    style: buyStyles.row2
  }, /*#__PURE__*/React.createElement("div", {
    style: buyStyles.field
  }, /*#__PURE__*/React.createElement("label", {
    style: buyStyles.label
  }, "Quantity (tCO\u2082e)"), /*#__PURE__*/React.createElement("input", {
    style: buyStyles.input,
    type: "number",
    value: qty,
    onChange: e => setQty(Math.max(1, parseInt(e.target.value || "0", 10)))
  })), /*#__PURE__*/React.createElement("div", {
    style: buyStyles.field
  }, /*#__PURE__*/React.createElement("label", {
    style: buyStyles.label
  }, "Buyer email"), /*#__PURE__*/React.createElement("input", {
    style: buyStyles.input,
    type: "email",
    placeholder: "you@company.com",
    value: email,
    onChange: e => setEmail(e.target.value),
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    style: buyStyles.summary
  }, /*#__PURE__*/React.createElement("div", {
    style: buyStyles.summaryRow
  }, /*#__PURE__*/React.createElement("span", null, "Price per tCO\u2082e"), /*#__PURE__*/React.createElement("span", {
    style: buyStyles.mono
  }, "$", pricePer, ".00")), /*#__PURE__*/React.createElement("div", {
    style: buyStyles.summaryRow
  }, /*#__PURE__*/React.createElement("span", null, "Quantity"), /*#__PURE__*/React.createElement("span", {
    style: buyStyles.mono
  }, qty, " tCO\u2082e")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...buyStyles.summaryRow,
      ...buyStyles.summaryTotal
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", {
    style: buyStyles.mono
  }, "$", total.toLocaleString(), ".00"))), /*#__PURE__*/React.createElement("button", {
    style: buyStyles.cta,
    type: "submit"
  }, "Buy now"), /*#__PURE__*/React.createElement("p", {
    style: buyStyles.fineprint
  }, "We'll send a confirmation and a methodology link to your email. No marketing.")));
};
const buyStyles = {
  section: {
    padding: "96px 56px",
    background: "#fff",
    maxWidth: 760
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--sv-fg-muted)",
    fontWeight: 500
  },
  h2: {
    fontFamily: "var(--sv-font-display)",
    fontSize: 48,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    margin: "16px 0 48px",
    maxWidth: "20ch"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 28
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--sv-fg)"
  },
  input: {
    fontFamily: "inherit",
    fontSize: 15,
    padding: "12px 14px",
    border: "1px solid var(--sv-border)",
    borderRadius: 4,
    color: "var(--sv-fg)",
    background: "#fff"
  },
  radios: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  radio: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    border: "1px solid var(--sv-border)",
    borderRadius: 4,
    fontSize: 14,
    cursor: "pointer",
    background: "#fff"
  },
  radioOn: {
    borderColor: "var(--sv-folly)",
    boxShadow: "0 0 0 3px rgba(219,48,85,0.15)"
  },
  summary: {
    background: "#f3f3f3",
    border: "1px solid #d9d9d9",
    borderRadius: 4,
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    fontSize: 14,
    color: "var(--sv-fg)"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between"
  },
  summaryTotal: {
    paddingTop: 12,
    borderTop: "1px solid #d9d9d9",
    fontWeight: 700,
    fontSize: 16
  },
  mono: {
    fontFamily: "var(--sv-font-mono)"
  },
  cta: {
    fontFamily: "var(--sv-font-sans)",
    fontSize: 16,
    fontWeight: 500,
    padding: "16px 32px",
    borderRadius: 999,
    border: 0,
    background: "#fe2c55",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "var(--sv-shadow-pop)",
    alignSelf: "flex-start"
  },
  fineprint: {
    fontSize: 12,
    color: "var(--sv-fg-muted)",
    margin: 0
  }
};
window.BuyForm = BuyForm;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/BuyForm.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
// Footer.jsx — Neutral warm-grey footer with values and links.

const Footer = () => {
  return /*#__PURE__*/React.createElement("footer", {
    style: footerStyles.foot
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.top
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.brand
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logo || "../../assets/SV_logo.png",
    alt: "",
    style: footerStyles.mark
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.word
  }, "Savimbo"), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.tag
  }, "Fair-trade carbon credits."))), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.cols
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.col
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.colHead
  }, "Projects"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Carbon"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Biodiversity"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Water"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Reforestation"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Ecotourism"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Agrobiodiversity"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Biochar")), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.col
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.colHead
  }, "Company"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Methodology"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Press"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Blog"), /*#__PURE__*/React.createElement("a", {
    style: footerStyles.link
  }, "Careers")), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.col
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.colHead
  }, "Values"), /*#__PURE__*/React.createElement("span", {
    style: footerStyles.value
  }, "Consciousness"), /*#__PURE__*/React.createElement("span", {
    style: footerStyles.value
  }, "Now"), /*#__PURE__*/React.createElement("span", {
    style: footerStyles.value
  }, "Trust"), /*#__PURE__*/React.createElement("span", {
    style: footerStyles.value
  }, "Respect"), /*#__PURE__*/React.createElement("span", {
    style: footerStyles.value
  }, "Abundance")))), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.bot
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Savimbo Inc. \xB7 Putumayo, Colombia."), /*#__PURE__*/React.createElement("span", {
    style: footerStyles.url
  }, "www.savimbo.com")));
};
const footerStyles = {
  foot: {
    background: "#f3f3f3",
    padding: "72px 56px 32px",
    color: "#6c6c6c",
    fontSize: 14
  },
  top: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 64,
    paddingBottom: 56,
    borderBottom: "1px solid #d9d9d9"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 14
  },
  mark: {
    width: 44,
    height: 44
  },
  word: {
    fontFamily: "var(--sv-font-display)",
    fontSize: 24,
    color: "var(--sv-fg)",
    letterSpacing: "-0.01em"
  },
  tag: {
    fontSize: 13,
    color: "#8a8a8a",
    marginTop: 2
  },
  cols: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 32
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  colHead: {
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--sv-fg)",
    fontWeight: 500,
    marginBottom: 6
  },
  link: {
    color: "#6c6c6c",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: 14
  },
  value: {
    color: "#6c6c6c",
    fontSize: 14,
    fontStyle: "italic"
  },
  bot: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: 24,
    fontSize: 12,
    color: "#8a8a8a"
  },
  url: {
    fontFamily: "var(--sv-font-mono)"
  }
};
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Header.jsx
try { (() => {
// Header.jsx — Savimbo top nav
// Swiss register: white, generous space, single Folly-pink CTA.

const Header = ({
  current = "home",
  onNav = () => {}
}) => {
  const links = [{
    id: "home",
    label: "Home"
  }, {
    id: "methodology",
    label: "Methodology"
  }, {
    id: "projects",
    label: "Projects"
  }, {
    id: "buy",
    label: "Buy credits"
  }];
  return /*#__PURE__*/React.createElement("header", {
    style: headerStyles.bar
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: headerStyles.brand,
    onClick: e => {
      e.preventDefault();
      onNav("home");
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logo || "../../assets/SV_logo.png",
    alt: "",
    style: headerStyles.mark
  }), /*#__PURE__*/React.createElement("span", {
    style: headerStyles.word
  }, "Savimbo")), /*#__PURE__*/React.createElement("nav", {
    style: headerStyles.nav
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.id,
    href: `#${l.id}`,
    onClick: e => {
      e.preventDefault();
      onNav(l.id);
    },
    style: {
      ...headerStyles.link,
      color: current === l.id ? "var(--sv-fg)" : "var(--sv-fg-muted)",
      fontWeight: current === l.id ? 500 : 400
    }
  }, l.label))), /*#__PURE__*/React.createElement("button", {
    style: headerStyles.cta,
    onClick: () => onNav("buy")
  }, "Buy now"));
};
const headerStyles = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 56px",
    borderBottom: "1px solid var(--sv-border)",
    background: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 10
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "var(--sv-fg)"
  },
  mark: {
    width: 32,
    height: 32
  },
  word: {
    fontFamily: "var(--sv-font-display)",
    fontSize: 22,
    letterSpacing: "-0.01em"
  },
  nav: {
    display: "flex",
    gap: 32
  },
  link: {
    textDecoration: "none",
    fontSize: 14,
    transition: "color 200ms"
  },
  cta: {
    fontFamily: "var(--sv-font-sans)",
    fontSize: 14,
    fontWeight: 500,
    padding: "10px 22px",
    borderRadius: 999,
    border: 0,
    background: "#fe2c55",
    color: "#fff",
    cursor: "pointer",
    transition: "all 200ms cubic-bezier(0.22,1,0.36,1)"
  }
};
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
// Hero.jsx — landing hero. Swiss principle: vast white, single sentence,
// one Folly-pink CTA. The emptiness is the brand.

const Hero = ({
  onCta
}) => {
  return /*#__PURE__*/React.createElement("section", {
    style: heroStyles.section
  }, /*#__PURE__*/React.createElement("span", {
    style: heroStyles.eyebrow
  }, "Fair-trade climate credits"), /*#__PURE__*/React.createElement("h1", {
    style: heroStyles.headline
  }, "Grow something great."), /*#__PURE__*/React.createElement("p", {
    style: heroStyles.sub
  }, "Direct from the subsistence farmers and Indigenous communities who steward tropical forests. No middlemen. No fortress conservation."), /*#__PURE__*/React.createElement("div", {
    style: heroStyles.row
  }, /*#__PURE__*/React.createElement("button", {
    style: heroStyles.cta,
    onClick: onCta
  }, "Buy now"), /*#__PURE__*/React.createElement("a", {
    href: "#methodology",
    style: heroStyles.link,
    onClick: e => {
      e.preventDefault();
    }
  }, "Read the methodology \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 96
    }
  }));
};
const heroStyles = {
  section: {
    padding: "112px 56px 96px",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    maxWidth: 980
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--sv-fg-muted)",
    fontWeight: 500
  },
  headline: {
    fontFamily: "var(--sv-font-display)",
    fontSize: 96,
    lineHeight: 1.02,
    letterSpacing: "-0.025em",
    color: "var(--sv-fg)",
    margin: 0,
    textWrap: "balance"
  },
  sub: {
    fontSize: 19,
    lineHeight: 1.5,
    color: "var(--sv-fg-muted)",
    maxWidth: "44ch",
    margin: "12px 0 0",
    textWrap: "pretty"
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 28,
    marginTop: 16
  },
  cta: {
    fontFamily: "var(--sv-font-sans)",
    fontSize: 16,
    fontWeight: 500,
    padding: "14px 30px",
    borderRadius: 999,
    border: 0,
    background: "#fe2c55",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "var(--sv-shadow-pop)"
  },
  link: {
    fontSize: 15,
    color: "var(--sv-fg-link)",
    textDecoration: "underline",
    textUnderlineOffset: 3
  }
};
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/MethodologySteps.jsx
try { (() => {
// MethodologySteps.jsx — "Plant trees → Grow trees → Track carbon → Certify → Sell → Retire"
// Unutterably simple, per the style guide. Mono labels, hairline rules.

const MethodologySteps = () => {
  const steps = [{
    n: 1,
    t: "Plant trees",
    d: "With local farmers; native species only."
  }, {
    n: 2,
    t: "Grow trees",
    d: "Monthly micropayments to families."
  }, {
    n: 3,
    t: "Track carbon",
    d: "Satellite + ground truthing."
  }, {
    n: 4,
    t: "Certify credits",
    d: "Cercarbono, CME Group methodology."
  }, {
    n: 5,
    t: "Sell credits",
    d: "Direct to buyer. No middlemen."
  }, {
    n: 6,
    t: "Retire",
    d: "Buyer claim issued; ledgered."
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: stepsStyles.section
  }, /*#__PURE__*/React.createElement("span", {
    style: stepsStyles.eyebrow
  }, "Methodology"), /*#__PURE__*/React.createElement("h2", {
    style: stepsStyles.h2
  }, "Six steps. Nothing fancier."), /*#__PURE__*/React.createElement("div", {
    style: stepsStyles.grid
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    style: stepsStyles.step
  }, /*#__PURE__*/React.createElement("div", {
    style: stepsStyles.num
  }, String(s.n).padStart(2, "0")), /*#__PURE__*/React.createElement("div", {
    style: stepsStyles.t
  }, s.t), /*#__PURE__*/React.createElement("div", {
    style: stepsStyles.d
  }, s.d)))));
};
const stepsStyles = {
  section: {
    padding: "96px 56px",
    background: "#fff",
    borderTop: "1px solid var(--sv-border)"
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--sv-fg-muted)",
    fontWeight: 500
  },
  h2: {
    fontFamily: "var(--sv-font-display)",
    fontSize: 56,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    margin: "16px 0 56px",
    maxWidth: "16ch"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    columnGap: 0,
    rowGap: 0,
    borderTop: "1px solid var(--sv-border)",
    borderLeft: "1px solid var(--sv-border)"
  },
  step: {
    padding: "32px 28px",
    borderRight: "1px solid var(--sv-border)",
    borderBottom: "1px solid var(--sv-border)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minHeight: 160
  },
  num: {
    fontFamily: "var(--sv-font-mono)",
    fontSize: 12,
    color: "var(--sv-folly)",
    letterSpacing: "0.05em"
  },
  t: {
    fontFamily: "var(--sv-font-sans)",
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2
  },
  d: {
    fontSize: 14,
    color: "var(--sv-fg-muted)",
    lineHeight: 1.5
  }
};
window.MethodologySteps = MethodologySteps;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/MethodologySteps.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ProjectCard.jsx
try { (() => {
// ProjectCard.jsx — list view for a credit project.
// Photo placeholder on top; name + meta below; one tag.

const ProjectCard = ({
  project,
  onOpen
}) => {
  return /*#__PURE__*/React.createElement("article", {
    style: cardStyles.card,
    onClick: () => onOpen?.(project)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...cardStyles.photo,
      background: project.tint || "var(--sv-cat-trees)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: cardStyles.placeholder
  }, "Photo \xB7 ", project.locale)), /*#__PURE__*/React.createElement("div", {
    style: cardStyles.body
  }, /*#__PURE__*/React.createElement("div", {
    style: cardStyles.tagRow
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...cardStyles.tag,
      ...cardStyles[project.kind]
    }
  }, project.kindLabel), /*#__PURE__*/React.createElement("span", {
    style: cardStyles.id
  }, project.id)), /*#__PURE__*/React.createElement("h3", {
    style: cardStyles.name
  }, project.name), /*#__PURE__*/React.createElement("div", {
    style: cardStyles.meta
  }, /*#__PURE__*/React.createElement("span", null, project.ha, " ha"), /*#__PURE__*/React.createElement("span", {
    style: cardStyles.dot
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, project.families, " families"), /*#__PURE__*/React.createElement("span", {
    style: cardStyles.dot
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, project.primary, "% primary")), /*#__PURE__*/React.createElement("div", {
    style: cardStyles.priceRow
  }, /*#__PURE__*/React.createElement("span", {
    style: cardStyles.price
  }, "$", project.price, /*#__PURE__*/React.createElement("span", {
    style: cardStyles.priceUnit
  }, "/tCO\u2082e")), /*#__PURE__*/React.createElement("a", {
    style: cardStyles.cta,
    onClick: e => {
      e.stopPropagation();
      onOpen?.(project);
    }
  }, "Open project \u2192"))));
};
const cardStyles = {
  card: {
    background: "#fff",
    border: "1px solid var(--sv-border)",
    borderRadius: 8,
    overflow: "hidden",
    cursor: "pointer",
    transition: "box-shadow 200ms cubic-bezier(0.22,1,0.36,1), transform 200ms",
    display: "flex",
    flexDirection: "column"
  },
  photo: {
    aspectRatio: "16 / 9",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.85)",
    fontFamily: "var(--sv-font-mono)",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  placeholder: {
    background: "rgba(0,0,0,0.18)",
    padding: "4px 10px",
    borderRadius: 999
  },
  body: {
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  tagRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  tag: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 600,
    background: "#f3f3f3",
    color: "#23232f"
  },
  // Rainbow category palette — soft fill + saturated text from the same hue
  carbon: {
    background: "#e6e6ea",
    color: "#23232f"
  },
  biodiversity: {
    background: "#fde0e1",
    color: "#c4393b"
  },
  water: {
    background: "#e6f3f7",
    color: "#2f7a8a"
  },
  reforestation: {
    background: "#e6f1de",
    color: "#3d6a2c"
  },
  ecotourism: {
    background: "#fbe9d8",
    color: "#a55a1f"
  },
  agrobiodiversity: {
    background: "#f8f1c9",
    color: "#806c1a"
  },
  id: {
    fontFamily: "var(--sv-font-mono)",
    fontSize: 11,
    color: "var(--sv-fg-muted)"
  },
  name: {
    fontFamily: "var(--sv-font-sans)",
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.2,
    color: "var(--sv-fg)"
  },
  meta: {
    fontSize: 13,
    color: "var(--sv-fg-muted)",
    display: "flex",
    gap: 6
  },
  dot: {
    opacity: 0.5
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 12,
    borderTop: "1px solid #d9d9d9"
  },
  price: {
    fontFamily: "var(--sv-font-display)",
    fontSize: 24,
    color: "var(--sv-fg)",
    letterSpacing: "-0.01em"
  },
  priceUnit: {
    fontFamily: "var(--sv-font-mono)",
    fontSize: 12,
    color: "var(--sv-fg-muted)",
    marginLeft: 4
  },
  cta: {
    fontSize: 14,
    color: "var(--sv-fg-link)",
    textDecoration: "none",
    cursor: "pointer"
  }
};
window.ProjectCard = ProjectCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ProjectCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/StatStrip.jsx
try { (() => {
// StatStrip.jsx — the "81 families · 3,425 ha · 87% primary" rail.
// Light rainbow tint washes — one hue per category.

const StatStrip = () => {
  const stats = [{
    num: "81",
    unit: "",
    label: "Families enrolled",
    cat: "trees"
  }, {
    num: "3,425",
    unit: "ha",
    label: "Forest under stewardship",
    cat: "water"
  }, {
    num: "87%",
    unit: "",
    label: "Primary forest",
    cat: "bio"
  }, {
    num: "12,400",
    unit: "tCO₂e",
    label: "Credits issued, 2026",
    cat: "carbon"
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: stripStyles.section
  }, stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...stripStyles.card,
      ...stripStyles[s.cat]
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: stripStyles.num
  }, s.num, s.unit && /*#__PURE__*/React.createElement("span", {
    style: stripStyles.unit
  }, s.unit)), /*#__PURE__*/React.createElement("div", {
    style: {
      ...stripStyles.label,
      color: stripStyles[s.cat].accent
    }
  }, s.label))));
};
const stripStyles = {
  section: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    padding: "56px 56px",
    borderTop: "1px solid var(--sv-border)",
    borderBottom: "1px solid var(--sv-border)",
    background: "#fff"
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "24px 22px",
    borderRadius: 10,
    border: "1px solid transparent"
  },
  carbon: {
    background: "#f1f1f3",
    borderColor: "#e4e4e8",
    accent: "#23232f"
  },
  bio: {
    background: "#fdeaeb",
    borderColor: "#f8d6d8",
    accent: "#d6474a"
  },
  water: {
    background: "#e7f4f8",
    borderColor: "#d0e9ef",
    accent: "#2f8a9c"
  },
  trees: {
    background: "#edf5e4",
    borderColor: "#dcebcd",
    accent: "#4a8b3f"
  },
  num: {
    fontFamily: "var(--sv-font-display)",
    fontSize: 52,
    lineHeight: 1,
    letterSpacing: "-0.02em",
    color: "var(--sv-fg)"
  },
  unit: {
    fontFamily: "var(--sv-font-mono)",
    fontSize: 15,
    color: "var(--sv-fg-muted)",
    marginLeft: 6,
    letterSpacing: 0
  },
  label: {
    fontSize: 14,
    fontWeight: 600
  }
};
window.StatStrip = StatStrip;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/StatStrip.jsx", error: String((e && e.message) || e) }); }

})();
