import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import HeadTools from './pages/HeadTools';
import PetMain from './pages/PetMain';
import PetDetail from './pages/example/PetDetail';
import Layout from './pages/chatLayout/Layout';
import Setting from './pages/Setting';
import Main from './pages/Main';

// function Hello() {
//   return <button className="btn w-64 rounded-full">Button</button>;
// }

// 创建 About 组件
export function About() {
  const [url, setUrl] = useState('init');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <>
      <h2>About1</h2>
      <h2>About2</h2>
      <div>{url}</div>
    </>
  );
}

// 创建 Home 组件，作为默认路由
export function Hello() {
  const [url, setUrl] = useState('init');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);
  return (
    <h2>
      Hello<div>{url}</div>
    </h2>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/pet" element={<PetMain />} />
        <Route path="/petDetail" element={HeadTools('win32', PetDetail())} />
        <Route path="/chatgpt" element={HeadTools('win32', Layout())} />
        <Route path="/setting" element={HeadTools('win32', Setting())} />
      </Routes>
    </Router>
  );
}
