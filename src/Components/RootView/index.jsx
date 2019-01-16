import React from "react";
import { Provider, connect } from "react-redux";
import { store } from "./../../Store";
import Actions from "../Actions";

const mapStateToProps = state => {
	return { ...state };
};

const ConnectedRouter = connect(mapStateToProps)(Actions);

export default class RootComponent extends React.Component {
	render() {
		return (
			<Provider store={store}>
				<ConnectedRouter />
			</Provider>
		);
	}
}
