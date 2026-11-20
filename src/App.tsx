import { useRef, useState } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { PortalHostSync } from "portal-route-sdk-demo";

const SERVICES = {
  "sub-app1": { name: "Sub App 1", origin: "http://localhost:5174", color: "#2563eb" },
  "sub-app2": { name: "Sub App 2", origin: "http://localhost:5175", color: "#059669" },
  "sub-app3": { name: "Sub App 3", origin: "http://localhost:5176", color: "#9333ea" },
} as const;
type ServiceId = keyof typeof SERVICES;

const shell: React.CSSProperties = { fontFamily: "system-ui, sans-serif", maxWidth: 1100, margin: "32px auto", padding: 24 };
const nav: React.CSSProperties = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #ddd" };
const button: React.CSSProperties = { textDecoration: "none", color: "#174ea6", fontWeight: 600 };

const demoCookie = "portal_demo_value";

function readDemoCookie() {
  const prefix = demoCookie + "=";
  const entry = document.cookie.split(";").map(cookie => cookie.trim()).find(cookie => cookie.startsWith(prefix));
  try {
    return entry ? decodeURIComponent(entry.slice(prefix.length)) : "";
  } catch {
    return "";
  }
}

function DemoCookieForm() {
  const [savedValue, setSavedValue] = useState(readDemoCookie);
  const [value, setValue] = useState(savedValue);

  return (
    <form onSubmit={event => {
      event.preventDefault();
      document.cookie = `${demoCookie}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
      setSavedValue(readDemoCookie());
    }}>
      <label>
        공유 테스트 쿠키{" "}
        <input value={value} onChange={event => setValue(event.target.value)} maxLength={100} required />
      </label>{" "}
      <button type="submit">쿠키 저장</button>
      <p role="status">저장된 값 <code>{savedValue || "없음"}</code></p>
    </form>
  );
}

function PortalLocation() {
  const { pathname, search, hash } = useLocation();
  return <p>부모 URL: <code>{pathname + search + hash}</code></p>;
}

function ServiceFrame({ id }: { id: ServiceId }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const service = SERVICES[id];
  const basePath = `/${id}`;

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: service.color }} />
        <h2 style={{ margin: 0 }}>{service.name}</h2>
      </div>
      <p>iframe origin: <code>{service.origin}</code></p>
      <nav style={nav}>
        <Link style={button} to={basePath}>Home (부모 링크)</Link>
        <Link style={button} to={`${basePath}/board`}>Board (부모 링크)</Link>
        <Link style={button} to={`${basePath}/detail/123`}>Detail (부모 링크)</Link>
        <button onClick={() => history.back()}>브라우저 뒤로가기</button>
        <button onClick={() => history.forward()}>브라우저 앞으로가기</button>
        <button onClick={() => window.location.reload()}>부모 새로고침</button>
      </nav>
      <PortalHostSync iframeRef={iframeRef} serviceOrigin={service.origin} basePath={basePath} />
      <iframe
        ref={iframeRef}
        title={service.name}
        src={`${service.origin}/`}
        style={{ marginTop: 16, width: "100%", height: 460, border: `2px solid ${service.color}`, borderRadius: 10, background: "white" }}
      />
    </section>
  );
}

function Home() {
  return <section style={{ marginTop: 28 }}>
    <h2>포털 홈</h2>
    <p>서비스를 선택하면 iframe이 표시되고, 서비스 내부 이동에 따라 부모 URL도 변경됩니다.</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
      {(Object.keys(SERVICES) as ServiceId[]).map(id => (
        <Link key={id} style={{ ...button, padding: 20, border: `2px solid ${SERVICES[id].color}`, borderRadius: 12 }} to={`/${id}`}>
          {SERVICES[id].name} 열기
        </Link>
      ))}
    </div>
  </section>;
}

export default function App() {
  return <BrowserRouter>
    <div style={shell}>
      <header>
        <h1 style={{ margin: 0 }}>Main App · Portal Host</h1>
        <nav style={nav}>
          <Link style={button} to="/">포털 홈</Link>
          {(Object.keys(SERVICES) as ServiceId[]).map(id => <Link key={id} style={button} to={`/${id}`}>{SERVICES[id].name}</Link>)}
        </nav>
      </header>
      <DemoCookieForm />
      <PortalLocation />
      <Routes>
        <Route path="/" element={<Home />} />
        {(Object.keys(SERVICES) as ServiceId[]).map(id => (
          <Route key={id} path={`/${id}/*`} element={<ServiceFrame key={id} id={id} />} />
        ))}
        <Route path="*" element={<p>페이지가 없습니다. <Link to="/">홈으로</Link></p>} />
      </Routes>
    </div>
  </BrowserRouter>;
}
