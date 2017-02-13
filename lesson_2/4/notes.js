window.ee = new EventEmitter();

var Task = React.createClass({
    deleteTask: function(id, e) {
        window.ee.emit('Delete.task', id);
    },
    updateStatus: function(props) {
        window.ee.emit('UpdateStatus.task', props);
    },
    isChecked: function(status) {
        if(status == 'completed') return 'checked';

        return '';
    },
    render: function() {
        return (
            <li>
                <input type="checkbox" checked = {this.isChecked(this.props.status)} onChange={this.updateStatus.bind(this, this.props)} />
                <span className="task-title">{this.props.children}</span>
                <span className="delete-note" onClick={this.deleteTask.bind(this, this.props.id)}> × </span>
            </li>
        )
    }
});

var TaskList = React.createClass({
    render: function() {
        return (
                <ul className="list">
                {
                    this.props.tasks.map(function(task, index) {
                        return (
                            <Task
                                status = {task.status}
                                key = {index}
                                id = {task.id}
                            >
                                {task.text}
                            </Task>
                        );
                    })
                }
                </ul>
            );
    }
});

var TaskEditor = React.createClass({
    getInitialState: function() {
        return {
            text: ''
        };
    },

    handleTextChange: function(event) {
        this.setState({ text: event.target.value });
    },

    handleTaskAdd: function() {
        var task = {
                status: 'new',
                text: this.state.text,
                id: Date.now()
        };
        window.ee.emit('Add.task', task);
        this.setState({ text: '' });
    },

    render: function() {
        return (
            <div className="note-editor">
                <textarea
                    placeholder="Enter your task here..."
                    rows={5}
                    className="textarea"
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <button className="add-button" onClick={this.handleTaskAdd}>Add</button>
            </div>
        );
    }
});

var TaskFilters = React.createClass({
    getInitialState: function() {
        return {
            allTasks: ['new', 'completed'],
            newTasks: ['new'],
            completedTasks: ['completed']
        };
    },
    handlerFilter: function(filter) {
        window.ee.emit('Filter.task', filter);
    },
    render: function() {
        return (
            <div>
                <button onClick={this.handlerFilter.bind(this, this.state.allTasks)}>All</button>
                <button onClick={this.handlerFilter.bind(this, this.state.newTasks)}>New</button>
                <button onClick={this.handlerFilter.bind(this, this.state.completedTasks)}>Completed</button>
            </div>
        );
    }
});

var TaskListApp = React.createClass({
    getInitialState: function() {
        return {
            taskList: []
        };
    },

    componentDidMount: function() {
        var self = this;
        var localTasks = JSON.parse(localStorage.getItem('tasks'));
        if (localTasks) {
            this.setState({ taskList: localTasks });
        }

        window.ee.addListener('Add.task', function(task) {
            var taskList = self.state.taskList;
            taskList.unshift(task);

            self._updateLocalStorage(taskList);
        });

        window.ee.addListener('Delete.task', function(id) {
            var taskList = self.state.taskList.filter(function(task) {
                return task.id !== id;
            });

            self._updateLocalStorage(taskList);
        });

        window.ee.addListener('UpdateStatus.task', function(props) {
            var taskList = self.state.taskList.map(function(task) {
                if(task.id === props.id) {
                    task.status = props.status == 'new' ? 'completed' : 'new';
                }

                return task;
            });

            self._updateLocalStorage(taskList);
        });

        window.ee.addListener('Filter.task', function(filter) {
            var localTasks = JSON.parse(localStorage.getItem('tasks'));
            var taskList = localTasks.filter(function(task) {
                return filter.indexOf(task.status) !== -1;
            });

            self.setState({ taskList: taskList});
        });
    },
    componentWillUnmount: function() {
        window.ee.removeListener('Add.task');
        window.ee.removeListener('Delete.task');
        window.ee.removeListener('UpdateStatus.task');
        window.ee.removeListener('Filter.task');
    },
    render: function() {
        return (
            <div className="task-list">
                <h2 className="app-header">What you need to do?</h2>
                <TaskEditor />
                <TaskList tasks = {this.state.taskList} />
                <TaskFilters />
            </div>
        );
    },

    _updateLocalStorage: function(newTasks) {
        var tasks = JSON.stringify(newTasks);
        localStorage.setItem('tasks', tasks);
        this.setState({ taskList: newTasks});
    }
});

ReactDOM.render(
    <TaskListApp />,
    document.getElementById('mount-point')
);