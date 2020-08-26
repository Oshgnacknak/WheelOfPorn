import React from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import Label from './Label.js';

class App extends React.Component {
    state = {
        tags: [],
        winner: -1,
        index: -1,
        theta: 0,
        dtheta: 0,
    };

    async spin()  {
        if (this.state.spinning) {
            this.setState({ dtheta: 0 });
            return;
        }

        const url = document.location.hostname === 'localhost' ? 'http://localhost:5000/spin' : '/spin';
        const res = await fetch(url);
        this.setState({ 
            tags: await res.json(),
            spinning: true,
            winner: -1,
            theta: Math.random() * 360,
            dtheta: 30 + Math.random(),
        });

        let last = Date.now();
        const anim = () => {
            const dt = last - Date.now();
            this.update(dt);

            if (this.state.dtheta > 0.01) {
                last = Date.now();
                requestAnimationFrame(anim);
            } else {
                this.setState({
                    spinning: false, 
                    winner: this.state.index 
                });
            }
        }
        requestAnimationFrame(anim);
    }

    update(dt) {
        const index = Math.floor(this.state.tags.length * (360-((this.state.theta+89)%360)) / 360);

        if (index !== this.state.index) { 
            new Audio('/click.mp3').play();
        }

        this.setState({
            index,
            theta: this.state.theta + this.state.dtheta,
            dtheta: this.state.dtheta * 0.995,
        })
    }

    winner() {
        if (this.state.winner < 0) {
            return (
                <div>
                    <strong>
                        { this.state.spinning 
                            ? 'Click the wheel to stop spinning!' 
                            : 'Click the wheel to spin!' 
                        }
                    </strong><br />
                    <img className="wop" alt="Time to spin the wheel of porn" src="/wheelofporn.gif" />
                </div>
            );
        }

        const winner = this.state.tags[this.state.winner];
        return (
            <div className="winner">
                <h1>Your tag is: {winner.name}</h1>
                <ul>
                    { winner.sites.map(site => (
                        <li key={site.baseUrl}>
                            <a href={site.url}>
                                <img alt="" src={site.icon} />
                                <strong>{site.hostname}</strong>
                            </a>
                        </li>
                    )) }
                </ul>
            </div>
        )
    }

    render() {
        const { tags } = this.state;
        return (
            <div className="app">
                <div className="spinner-container">
                    <div
                        onClick={ () => this.spin() }
                        className="spinner"
                        style={{
                            transform: `translate(-50%) rotate(${this.state.theta}deg)`,
                        }}
                    >
                        <PieChart
                            className="wheel"
                            totalValue={tags.length}
                            paddingAngle={1}
                            labelPosition="95"
                            label={
                                props => (
                                    <Label key={tags[props.dataIndex].name} {...props}>
                                        {tags[props.dataIndex].name.toUpperCase()}
                                    </Label>
                                )
                            }
                            data={
                                tags.map((tag, i) => ({
                                    title: `${tag.name}: ${tag.sites.length} sites`,
                                    value: 1,
                                    color: `hsl(${360 * i*3/tags.length}, 100%, ${i === this.state.index ? 70 : 40}%)`,
                                }))
                            }
                        />
                    </div>
                    <div className="arrow"></div>
                </div>
                { this.winner() }
            </div>
        );
    }
}

export default App;
