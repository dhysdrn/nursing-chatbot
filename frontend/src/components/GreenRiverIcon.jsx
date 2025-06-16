/**
 * @description
 * GreenRiverIcon component renders the Green River Nursing icon image.
 *
 * @returns {JSX.Element} The image element displaying the icon.
 * @version 1.0
 */
import GreenRiverNursingIcon from '../assets/icon.png'

const GreenRiverIcon = () => {
    return (
        <img src={GreenRiverNursingIcon} alt="green river nursing icon" style={{ width: '100px', }}/>
    )
}

export default GreenRiverIcon;