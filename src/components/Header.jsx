import React from 'react'
import { SiCanva } from "react-icons/si";

function Header() {
    return (
        <div className="header">
            <nav className="py-2 bg-body-tertiary border-bottom"> <div className="container d-flex flex-wrap"> <ul className="nav me-auto"> <li className="nav-item"><a href="/" className="nav-link link-body-emphasis px-2 active" aria-current="page">Home</a></li> <li className="nav-item"><a href="#" className="nav-link link-body-emphasis px-2">About</a></li> </ul> <ul className="nav"> <li className="nav-item"><a href="/" className="nav-link link-body-emphasis px-2">Login</a></li> <li className="nav-item"><a href="/" className="nav-link link-body-emphasis px-2">Sign up</a></li> </ul> </div> </nav>
            <header className="py-3 mb-4 border-bottom"> <div className="container d-flex flex-wrap justify-content-center"> <a href="/" className="d-flex align-items-center mb-3 mb-lg-0 me-lg-auto link-body-emphasis text-decoration-none"> <span className="fs-4" style={{color:"#4e4ebe"}}><SiCanva style={{fontSize:"3.8rem"}}/> Canva</span> </a> <form className="col-12 col-lg-auto mb-3 mb-lg-0" role="search"> <input type="search" className="form-control" placeholder="Search..." aria-label="Search" /> </form> </div> </header>
        </div>
    )
}

export default Header