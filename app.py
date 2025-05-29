from flask import Flask, render_template, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///messages.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    mobile = db.Column(db.String(20))
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Message {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'mobile': self.mobile,
            'subject': self.subject,
            'message': self.message,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# Create the database tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/submit_message', methods=['POST'])
def submit_message():
    if request.method == 'POST':
        # Get form data
        name = request.form['name']
        email = request.form['email']
        mobile = request.form.get('mobile', '')
        subject = request.form.get('subject', '')
        message_content = request.form['message']
        
        # Create new message
        new_message = Message(
            name=name,
            email=email,
            mobile=mobile,
            subject=subject,
            message=message_content
        )
        
        # Add to database
        db.session.add(new_message)
        db.session.commit()
        
        # Return success response
        return jsonify({"status": "success", "message": "Thank you for your message!"})
    
    return jsonify({"status": "error", "message": "Something went wrong!"})

@app.route('/admin/messages', methods=['GET'])
def view_messages():
    messages = Message.query.order_by(Message.created_at.desc()).all()
    return render_template('admin.html', messages=messages)

@app.route('/admin/stats', methods=['GET'])
def view_stats():
    # Get today's date
    today = datetime.utcnow().date()
    
    # Calculate week start (Monday of current week)
    start_of_week = today - timedelta(days=today.weekday())
    
    # Query total messages
    total_messages = Message.query.count()
    
    # Query today's messages
    today_start = datetime.combine(today, datetime.min.time())
    today_messages = Message.query.filter(Message.created_at >= today_start).count()
    
    # Query this week's messages
    week_start = datetime.combine(start_of_week, datetime.min.time())
    this_week_messages = Message.query.filter(Message.created_at >= week_start).count()
    
    # Get recent messages
    recent_messages = Message.query.order_by(Message.created_at.desc()).limit(5).all()
    
    return render_template('stats.html', 
                           total_messages=total_messages,
                           today_messages=today_messages,
                           this_week_messages=this_week_messages,
                           recent_messages=recent_messages)

@app.route('/api/messages', methods=['GET'])
def get_messages():
    messages = Message.query.order_by(Message.created_at.desc()).all()
    return jsonify([message.to_dict() for message in messages])

# Handle 404 errors
@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)