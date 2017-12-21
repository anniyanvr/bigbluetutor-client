/*
BigBlueButton open source conferencing system - http://www.bigbluebutton.org/

Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).

This file is part of BigBlueTutor.

BigBlueTutor is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

BigBlueTutor is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with BigBlueTutor.  If not, see <http://www.gnu.org/licenses/>.
*/
import { Component } from '@angular/core';
import { NavController, Events, MenuController, ViewController } from 'ionic-angular';
import { ProfilePage } from '../profilepage/profilepage';
import { UserPage } from '../userpage/userpage';
import { Category } from '../category/category';
import { DsService } from '../../shared/ds.service';
import { RecordListenService } from '../../shared/recordlisten.service';
import * as $ from 'jquery';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private search;
  categories;
  tutors;
  tutorsData;
  searchCategories;
  searchTutors;
  imageLocations;
  hasNewMessage;

  constructor(public navCtrl: NavController, public menuCtrl:MenuController, public viewCtrl: ViewController, public events: Events, private ds: DsService, private rls: RecordListenService) {
    this.imageLocations = {
      "Math" : "./assets/icon/math.png",
      "Language": "./assets/icon/language.png",
      "Social Sciences": "./assets/icon/social.png",
      "Science": "./assets/icon/science.png",
      "Arts": "./assets/icon/art.png",
      "Business": "./assets/icon/business.png"
    }
    var categoryData = ds.dataRecord.get('categories');
    this.categories = [];
    for (var category in categoryData) {
      this.categories.push({category: category, img: this.imageLocations[category]});
    }
    this.search = "";

  }

  ionViewWillEnter() {
    this.menuCtrl.swipeEnable(true);
    var newMessages = this.ds.profileRecord.get('newMessagesCount');
    for (var message in newMessages) {
      if(newMessages[message]) {
        this.hasNewMessage = true;
        break;
      }
    }
    this.events.subscribe('user:newMessage', () => {
      this.hasNewMessage = true;
    });
  }

  ionViewDidLeave() {
    this.events.unsubscribe('user:newMessage')
  }

  onInput(event) {
    //doesn't show anything if it is empty
    if (this.search == "") {
      this.searchCategories = [];
      this.searchTutors = [];
    }else {
      //rpc call to get tutors
      this.ds.dsInstance.rpc.make('search', {param: this.search}, function(error, data) {
        this.searchTutors = data.data;
      }.bind(this));
      //sort categories
      var categoryData = this.ds.dataRecord.get('categories');
      this.searchCategories = [];
      for (var category in categoryData) {
        this.searchCategories.push(category);
      }
      for (var category in categoryData) {
        var subCategories = categoryData[category];
        for (var i =0;i<subCategories.length;i++) {
          this.searchCategories.push(subCategories[i]);
        }
      }
      //local sorting of categories
      this.searchCategories = this.searchCategories.filter(function(text) {
        return text.toLowerCase().includes(this.search.toLowerCase());
      }.bind(this));
      this.searchCategories = this.searchCategories.sort(function(a, b){
        if(a.firstname < b.firstname) return -1;
        if(a.firstname > b.firstname) return 1;
        return 0;
      });
    }
    $('.searchresults').css({'display':'block'});
  }

  categorySelected(category) {
    this.navCtrl.push(Category, {category:category});
  }

  userSelected(tutor) {
    if (tutor.username === this.ds.profileRecord.get('username')) {
      this.navCtrl.push(ProfilePage);
    }else {
      this.navCtrl.push(UserPage, {user:tutor});
    }
  }

  //searchbar animation
  searchbar(){
    $('.home-bkg').animate({'height':'20vh','opacity':'0.5'}, 300);
    $('.hamburger').fadeOut();
    $('#backgroundcontent, .categorycontainer, .logo').animate({'opacity':'0'},200)
      .queue(function(next){
        $('#backgroundcontent, .categorycontainer, .logo').css({'display':'none'})
      next();
      });
    $('.resultscont').css("display","block");
    $('.menubtn').hide();
    $('.search').animate({'top':'7vh'},300)
      .queue(function(next){
        $('.searchcancel').animate({'opacity':'1'});
        $('.searchcancel').css('display','block');
      next();
    });
    this.onInput("");
  }

  cancelsearch(ev){
    var HTMLElement = document.getElementsByClassName("searchbar");
    this.search = "";
    $('.hamburger').fadeIn();
    $('.menubtn').show();
    $('.searchresults').css('display','none');
    $('.resultscont').css("display","none");
    $('.home-bkg').animate({'height':'63vh','opacity':'1'}, 300);
    $('#backgroundcontent, .logo').css({'display':'block'})
    $('.categorycontainer').css({'display':'flex'})
    $('#backgroundcontent, .categorycontainer, .logo').animate({'opacity':'1'},400);
    $('.searchcancel').animate({'opacity':'0'},300);
    $('.search').animate({'top':'37vh'},300)
      .queue(function(next){
        $('.searchcancel').css('display','none');
      next();
    });

  }

}
