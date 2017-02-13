var Note = React.createClass({
    render: function() {
        var style = { backgroundColor: this.props.color };
        return (
            <div className="note" style={style}>
                <span className="delete-note" onClick={this.props.onDelete}> × </span>
                {this.props.children}
            </div>
        );
    }
});

var NoteEditor = React.createClass({
    getInitialState: function() {
        return {
            text: '',
            color: '#ff0000'
        };
    },

    handleTextChange: function(event) {
        this.setState({ text: event.target.value });
    },

    handlerColorChange: function(event) {
        this.setState({color: event.target.value});
    },

    handleNoteAdd: function() {
        var newNote = {
            text: this.state.text,
            color: this.state.color,
            id: Date.now()
        };

        this.props.onNoteAdd(newNote);
        this.setState({ text: '' });
    },

    render: function() {
        return (
            <div className="note-editor">
                <input type="color" onChange={this.handlerColorChange} value={this.state.color} />
                <textarea
                    placeholder="Enter your note here..."
                    rows={5}
                    className="textarea"
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <button className="add-button" onClick={this.handleNoteAdd}>Add</button>
            </div>
        );
    }
});

var NotesGrid = React.createClass({
    componentDidMount: function() {
        var grid = this.refs.grid;
        this.msnry = new Masonry( grid, {
            itemSelector: '.note',
            columnWidth: 200,
            gutter: 10,
            isFitWidth: true
        });
    },

    componentDidUpdate: function(prevProps) {
        if (this.props.notes.length !== prevProps.notes.length) {
            this.msnry.reloadItems();
            this.msnry.layout();
        }
    },

    render: function() {
        var onNoteDelete = this.props.onNoteDelete;

        return (
            <div className="notes-grid" ref="grid">
                {
                    this.props.notes.map(function(note){
                        return (
                            <Note
                                key={note.id}
                                onDelete={onNoteDelete.bind(null, note)}
                                color={note.color}>
                                {note.text}
                            </Note>
                        );
                    })
                }
            </div>
        );
    }
});

var NotesFind = React.createClass({
    handlerFilter: function(event) {
        var searchQuery = event.target.value.toLowerCase();
        this.props.onFilter(searchQuery);
    },
    render: function() {

        return (
                <div className="search">
                    <input type="text" ref="searchinput" value={this.props.searchValue} onChange={this.handlerFilter} />
                </div>
            )
    }
});

var NotesApp = React.createClass({
    getInitialState: function() {
        return {
            notes: [],
            searchQuery: ''
        };
    },

    componentDidMount: function() {
        var localNotes = JSON.parse(localStorage.getItem('notes'));
        if (localNotes) {
            this.setState({ notes: localNotes });
        }
    },

    handleNoteDelete: function(note) {
        var noteId = note.id;
        var localNotes = JSON.parse(localStorage.getItem('notes'));
        var newNotes = localNotes.filter(function(note) {
            return note.id !== noteId;
        });
        this._updateLocalStorage(newNotes);
    },

    handleNoteAdd: function(newNote) {
        var localNotes = JSON.parse(localStorage.getItem('notes'));
        var newNotes = localNotes.slice();
        newNotes.unshift(newNote);
        this._updateLocalStorage(newNotes);
    },

    handlerFilter: function(searchQuery) {
        var localNotes = JSON.parse(localStorage.getItem('notes'));

        var displayNotes = localNotes.filter(function(el) {
            var searchValue = el.text.toLowerCase();
            return searchValue.indexOf(searchQuery) !== -1;
        });

        this.setState({ notes: displayNotes, searchQuery: searchQuery });
    },

    render: function() {
        return (
            <div className="notes-app">
                <h2 className="app-header">NotesApp</h2>
                <NotesFind onFilter={this.handlerFilter} searchValue = {this.state.searchQuery}/>
                <NoteEditor onNoteAdd={this.handleNoteAdd} />
                <NotesGrid notes={this.state.notes} onNoteDelete={this.handleNoteDelete} />
            </div>
        );
    },

    _updateLocalStorage: function(newNotes) {
        var notes = JSON.stringify(newNotes);
        localStorage.setItem('notes', notes);
        this.setState({ notes: newNotes, searchQuery: '' });
    }
});

ReactDOM.render(
    <NotesApp />,
    document.getElementById('mount-point')
);