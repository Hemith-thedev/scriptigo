import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from "./components/layout/Header.jsx";

function InitAppWindow({ visibleIf }) {
  return (
    <div className={`${visibleIf ? "" : "hidden"}`}>
      <div className="bg-primary-300 h-fit w-fit">
        <h1>Scriptigo</h1>
      </div>
    </div>
  )
}

function App() {
  const location = useLocation();
  return (
    <>
      <Header />
      <Routes location={location} key={location.pathname}>
      </Routes>
      <InitAppWindow visibleIf={location.pathname === "/"} />
    </>
  )
}

export default App
