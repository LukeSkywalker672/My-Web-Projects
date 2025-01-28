const Person = props => {
    return React.createElement('div', {}, [       //The {} are the attributees. 
        React.createElement('h1', {}, props.name),  //In this cas, there are none
        React.createElement('p', {}, props.occupation)
    ]);
}

const App = () => {
    return React.createElement('div', {}, [
        React.createElement('h1', {class: 'title'}, "React IS rendered"),
        React.createElement(Person, {name: 'Lukas', occupation: 'student'}, null), 
        React.createElement(Person, {name: 'Greg', occupation: 'ethical hacker'}, null),
        React.createElement(Person, {name: 'Lucas', occupation: 'Null-ptr programmer'}, null),
        React.createElement(Person, {name: 'David', occupation: 'designer'}, null)
    ])
};            //attributes in {} become props

ReactDOM.render(React.createElement(App), document.getElementById('root'));


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));