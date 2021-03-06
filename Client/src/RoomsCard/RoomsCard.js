import React, { Component } from 'react';
import { ListGroupItem } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { FaShareSquare, FaTrashAlt, FaRegClipboard, FaClipboardCheck } from 'react-icons/fa';
import { CopyToClipboard } from 'react-copy-to-clipboard';
class RoomsCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isItemContentVisible: {},
			clipBoardClicked: {}
		};
	}

	onClick = (id) => {
		this.props.history.push(`/VideoQueue/${id}`);
	};
	changeClip = (e, id) => {
		e.stopPropagation();
		this.setState({
			clipBoardClicked: {
				...this.state.clipBoardClicked,
				[id]: true
			}
		});
	};

	add = (id) => {
		const name = window.location.origin + `/VideoQueue/${id}`;
		return (
			<React.Fragment>
				{this.state.clipBoardClicked[id] ? (
					<FaClipboardCheck className="float-right mx-2 clip" onClick={(e) => e.stopPropagation()} />
				) : (
					<CopyToClipboard text={name}>
						<FaRegClipboard className="float-right mx-2 clip" onClick={(e) => this.changeClip(e, id)} />
					</CopyToClipboard>
				)}

				<input type="text" value={name} className="float-right" readOnly onClick={(e) => e.stopPropagation()} />
			</React.Fragment>
		);
	};

	showShare = (e) => {
		e.stopPropagation();
		this.props.showShare();
	};

	showContent = (e, id) => {
		e.stopPropagation();
		this.setState({
			isItemContentVisible: {
				...this.state.isItemContentVisible,
				[id]: true
			}
		});
	};
	render() {
		const shared = (id) =>
			this.state.isItemContentVisible[id] ? (
				this.add(id)
			) : (
				<FaShareSquare color="white" onClick={(e) => this.showContent(e, id)} className="" size="1.5em" />
			);
		const data = this.props.roomData || [];
		const display = data.map((item) => (
			<ListGroupItem
				key={item.roomID}
				className="pointer d-flex align-items-center w-100"
				onClick={() => this.onClick(item.roomID)}>
				<h4 className="float-left w-25">{item.roomName}</h4>
				<div className="d-flex align-items-center justify-content-end w-75 float-right">
					{shared(item.roomID)}
					<FaTrashAlt
						color="white"
						size="1.5em"
						className="ml-1"
						onClick={(e) => this.props.onDeletes(e, item.roomID)}
					/>
				</div>
			</ListGroupItem>
		));
		const noVids = (
			<div>
				<h3>No Rooms</h3>
			</div>
		);
		return <React.Fragment>{this.props.roomData ? display : noVids}</React.Fragment>;
	}
}
export default withRouter(RoomsCard);
