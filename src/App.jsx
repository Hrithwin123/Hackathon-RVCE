import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import AuthForm from "./pages/Authform"
import Flowers from "./pages/Flowers"
import CommunityChat from "./pages/Community"

export default function  App(){

return(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing/>}></Route>
      <Route path="/auth" element={<AuthForm/>} ></Route>
      <Route path="/flowers/:id" element={<Flowers/>}></Route>
      <Route path="/community/:id" element={<CommunityChat/>}></Route>
    </Routes>
  </BrowserRouter>
)

}