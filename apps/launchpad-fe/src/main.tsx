import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import {
  Root,
  Chain,
  Faucet,
  Launch,
  View,
  Collection,
} from './pages'
import { Layout } from './layout'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Root />} />
          <Route path="/chain" element={<Chain />} />
          <Route path="/faucet" element={<Faucet />} />
          <Route path="/view/:smartContractAddress/:tokenId" element={<View />} />
          <Route path="/view/:smartContractAddress/:tokenId/:chainIdHex" element={<View />} />
          <Route path="/view/:smartContractAddress" element={<Collection />} />
          <Route path="/collection/:smartContractAddress/:chainIdHex" element={<Collection />} />
        </Route>
        <Route element={<Layout isLoginRequired />}>
          <Route path="/launch" element={<Launch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
