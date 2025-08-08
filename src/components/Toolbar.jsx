import React from 'react'
import { PiRectangleDashedLight } from "react-icons/pi";
import { TbCircleDashed } from "react-icons/tb";
import { IoTextOutline } from "react-icons/io5";
import { FaPenAlt } from "react-icons/fa";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { LuUndo2 } from "react-icons/lu";
import { LuRedo2 } from "react-icons/lu";
import { FaDownload } from "react-icons/fa6";

function Toolbar({ addRect, addCircle, addText, togglePen, handleShare, handleDelete, isPenActive, handleColorChange, handleUndo, enableUndo, enableRedo, handleRedo, handleExport, handleLockObject, handleUnlockObject}) {
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
            <button disabled={enableUndo < 2} className='btn btn-warning' title='Undo' onClick={handleUndo}><LuUndo2 style={{ fontSize: '1.5rem' }}/></button>
            <button disabled={!enableRedo} className='btn btn-warning' title='Redo' onClick={handleRedo}><LuRedo2 style={{ fontSize: '1.5rem' }}/></button>
            <button className='btn btn-danger' title='Delete' onClick={handleDelete}><MdDelete style={{ fontSize: '1.5rem' }} /></button>
            <button className="btn btn-success" title='Download as PNG' onClick={handleExport}><FaDownload /></button>
            <button className="btn btn-primary" title='Share Canvas' onClick={handleShare}>Share <FaRegShareFromSquare style={{ fontSize: '1.5rem' }} /></button>
            <button onClick={handleLockObject}>Lock</button>
            <button onClick={handleUnlockObject}>Unlock</button>

        </div>
    )
}

export default Toolbar