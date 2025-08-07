import React from 'react'
import { PiRectangleDashedLight } from "react-icons/pi";
import { TbCircleDashed } from "react-icons/tb";
import { IoTextOutline } from "react-icons/io5";
import { FaPenAlt } from "react-icons/fa";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";


function Toolbar({ addRect, addCircle, addText, togglePen, handleShare, handleDelete, isPenActive, handleColorChange, handleUndo, handleRedo }) {
    return (
        <div className="toolbar">
            <button className="btn btn-outline-primary" onClick={addRect}>Rectangle <PiRectangleDashedLight style={{ fontSize: '1.5rem' }} /></button>
            <button className="btn btn-outline-secondary" onClick={addCircle}>Circle <TbCircleDashed style={{ fontSize: '1.5rem' }} /></button>
            <button className="btn btn-outline-dark" onClick={addText}>Text <IoTextOutline style={{ fontSize: '1.5rem' }} /></button>
            <button className="btn btn-outline-dark" onClick={togglePen}>
                {isPenActive ? "Disable Pen" : "Pen Tool"}
                <FaPenAlt style={{ fontSize: '1.5rem' }} />
            </button>
            <div className='colorpicker'>
            <input
                type="color"
                onChange={e => handleColorChange(e.target.value)}
                style={{ width: 34, height: 34, border: "none", marginLeft: 6 }}
                title="Change color of selected object"
            />
            <span>pick color</span>
            </div>
            <button className="btn btn-warning" onClick={handleUndo}>Undo</button>
            <button className="btn btn-warning" onClick={handleRedo}>Redo</button>

            <button className='btn btn-danger' onClick={handleDelete}>Delete <MdDelete style={{ fontSize: '1.5rem' }} /></button>
            <button className="btn btn-primary" onClick={handleShare}>Share Canvas <FaRegShareFromSquare style={{ fontSize: '1.5rem' }} /></button>
        </div>
    )
}

export default Toolbar