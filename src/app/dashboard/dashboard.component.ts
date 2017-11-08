import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

interface Post {
  message: string;
  uid: string;
  date: number;
}

interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  messageCol: AngularFirestoreCollection<Post>;
  messages: Observable<Post[]>;

  usersCol: AngularFirestoreCollection<User>;
  users: Observable<User[]>;

  test;

  message: string;
  editingMode = 0;
  uid = '';

  constructor(
    private afs: AngularFirestore,
    public auth: AuthService
  ) { }

  ngOnInit() {
    const that = this;
    this.getUid();
    this.messageCol = this.afs.collection('messages', ref => ref.orderBy('date', 'desc').limit(20));
    this.messages = this.messageCol.valueChanges().do(res => {
      res.forEach(function(msg) {
        // FIND USER WITH UID AND GET HIS PHOTO
        that.afs.collection('users').doc(msg.uid).valueChanges().subscribe(user => {
          msg['photoURL'] = user['photoURL'];
        });
        // Finding personal messages
        that.auth.user.subscribe(val => {
          if (msg['uid'] === val.uid) {
            msg['personal'] = true;
          } else {
            msg['personal'] = false;
          }
        });
      });
    });
    this.usersCol = this.afs.collection('users');
    this.users = this.usersCol.valueChanges();

    this.test = this.messages.map(function(msg) {
      console.log(msg);
    });
  }

  addMessage() {
    this.afs.collection('messages').add({
      'message': this.message,
      'uid': this.uid,
      'date': new Date()
    }).then((docRef) => {
      this.afs.collection('messages').doc(docRef.id).update({
        msg_id: docRef.id
      });
    });
    this.message = '';
  }

  deleteMessage(msg) {
    console.log('Deleting: ' + msg.msg_id);
    this.afs.collection('messages').doc(msg.msg_id).delete();
  }

  editMessage(msg) {
    if (!this.editingMode) {
      console.log('Start editing: ' + msg.msg_id);
      this.editingMode = msg.msg_id;
    } else {
      console.log('Finish editing: ' + msg.msg_id);
      this.editingMode = 0;
      this.afs.collection('messages').doc(msg.msg_id).update({
        'message': msg.message,
        'date': new Date()
      });
    }
  }

  getUid() {
    this.auth.user.subscribe(val => {
      if (val) {
        this.uid = val.uid;
      } else {
        this.uid = '';
      }
    });
  }
}
