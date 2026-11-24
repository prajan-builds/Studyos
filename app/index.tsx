import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, useColorScheme, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Task = { id: string; title: string; subject: string; due: string; done: boolean };
type Subject = { name: string; color: string; total: number; completed: number };
const KEY = 'studyos.v1';
const initialSubjects: Subject[] = [
  { name: 'Mathematics', color: '#8B7CF6', total: 12, completed: 4 },
  { name: 'Physics', color: '#45A7D8', total: 10, completed: 3 },
  { name: 'Chemistry', color: '#E59A55', total: 11, completed: 5 },
  { name: 'Computer Science', color: '#50B69A', total: 9, completed: 2 },
  { name: 'English', color: '#D77FA6', total: 8, completed: 3 },
  { name: 'Tamil', color: '#9A9DA8', total: 8, completed: 2 },
];
const initialTasks: Task[] = [
  { id: '1', title: 'Revise electrostatics formulas', subject: 'Physics', due: 'Today', done: false },
  { id: '2', title: 'Complete exercise 7.2', subject: 'Mathematics', due: 'Tomorrow', done: false },
  { id: '3', title: 'Read organic chemistry notes', subject: 'Chemistry', due: 'Nov 27', done: true },
];

export default function Home() {
  const systemDark = useColorScheme() === 'dark';
  const [dark, setDark] = useState(systemDark);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<'Today' | 'Syllabus'>('Today');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [due, setDue] = useState('Today');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.tasks) setTasks(saved.tasks);
        if (saved.subjects) setSubjects(saved.subjects);
        if (typeof saved.dark === 'boolean') setDark(saved.dark);
      }
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify({ tasks, subjects, dark })).catch(() => {});
  }, [tasks, subjects, dark, loaded]);

  const completed = tasks.filter(t => t.done).length;
  const pending = tasks.filter(t => !t.done).length;
  const progress = Math.round(subjects.reduce((a, s) => a + s.completed, 0) / subjects.reduce((a, s) => a + s.total, 0) * 100);
  const todayTasks = useMemo(() => tasks.filter(t => !t.done), [tasks]);
  const c = dark ? {
    bg:'#101114', panel:'#191B20', card:'#20232A', text:'#F4F4F5', muted:'#9297A3',
    line:'#2B2E36', accent:'#A99BFF', input:'#242730', soft:'#29263E'
  } : {
    bg:'#F6F6F8', panel:'#FFFFFF', card:'#F2F2F6', text:'#20212A', muted:'#777B88',
    line:'#E9E9EF', accent:'#6758D8', input:'#F5F5F8', soft:'#EFEDFF'
  };
  const styles = makeStyles(c);

  function toggleTask(id: string) {
    setTasks(old => old.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }
  function addTask() {
    if (!title.trim()) { Alert.alert('Add a task', 'Enter a task title first.'); return; }
    setTasks(old => [{ id: Date.now().toString(), title: title.trim(), subject, due, done: false }, ...old]);
    setTitle(''); setShowAdd(false);
  }
  function addChapter(name: string) {
    setSubjects(old => old.map(s => s.name === name ? { ...s, completed: Math.min(s.total, s.completed + 1) } : s));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <View>
          <Text style={styles.eyebrow}>YOUR STUDY SPACE</Text>
          <Text style={styles.brand}>StudyOS<Text style={styles.dot}>.</Text></Text>
        </View>
        <Pressable onPress={() => setDark(!dark)} style={styles.themeButton} accessibilityLabel="Toggle theme">
          <Ionicons name={dark ? 'sunny-outline' : 'moon-outline'} size={20} color={c.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <View>
            <Text style={styles.hello}>Good to see you,</Text>
            <Text style={styles.heading}>Let's make today count.</Text>
          </View>
          <View style={styles.datePill}><Ionicons name="calendar-outline" size={14} color={c.accent}/><Text style={styles.dateText}> MY STUDY PLAN</Text></View>
        </View>

        <View style={styles.stats}>
          <View style={[styles.statCard,{flex:1}]}>
            <Text style={styles.statLabel}>SYLLABUS DONE</Text>
            <Text style={styles.statNumber}>{progress}<Text style={styles.percent}>%</Text></Text>
            <View style={styles.track}><View style={[styles.fill,{width:progress+'%'}]}/></View>
          </View>
          <View style={[styles.statCard,{flex:1}]}>
            <Text style={styles.statLabel}>TASKS LEFT</Text>
            <Text style={styles.statNumber}>{pending}<Text style={styles.percent}> tasks</Text></Text>
            <Text style={styles.statHint}>{completed} completed so far</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {(['Today','Syllabus'] as const).map(t => <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab,tab===t && styles.activeTab]}><Text style={[styles.tabText,tab===t && styles.activeTabText]}>{t}</Text></Pressable>)}
        </View>

        {tab === 'Today' ? <>
          <View style={styles.sectionHead}>
            <View><Text style={styles.sectionTitle}>Your tasks</Text><Text style={styles.sectionSub}>{pending} things to focus on</Text></View>
            <Pressable onPress={() => setShowAdd(true)} style={styles.addButton}><Ionicons name="add" size={18} color="#FFFFFF"/><Text style={styles.addText}> Add task</Text></Pressable>
          </View>
          {todayTasks.length === 0 ? <View style={styles.empty}><Ionicons name="checkmark-circle-outline" size={28} color={c.accent}/><Text style={styles.emptyTitle}>All caught up</Text><Text style={styles.muted}>Add a task when you're ready for the next one.</Text></View> :
            todayTasks.map(task => <View key={task.id} style={styles.task}>
              <Pressable onPress={() => toggleTask(task.id)} style={styles.check}><Ionicons name="ellipse-outline" size={23} color={c.muted}/></Pressable>
              <View style={{flex:1}}><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.taskMeta}>{task.subject}  ·  {task.due}</Text></View>
              <Pressable onPress={() => setTasks(old => old.filter(t => t.id !== task.id))} hitSlop={10}><Ionicons name="ellipsis-horizontal" size={20} color={c.muted}/></Pressable>
            </View>)}
          {tasks.some(t => t.done) && <><Text style={styles.completedLabel}>COMPLETED</Text>{tasks.filter(t=>t.done).map(task=><View key={task.id} style={styles.task}><Pressable onPress={()=>toggleTask(task.id)} style={styles.check}><Ionicons name="checkmark-circle" size={23} color={c.accent}/></Pressable><View style={{flex:1}}><Text style={[styles.taskTitle,{textDecorationLine:'line-through',color:c.muted}]}>{task.title}</Text><Text style={styles.taskMeta}>{task.subject}  ·  {task.due}</Text></View></View>)}</>}
        </> : <>
          <View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>Syllabus tracker</Text><Text style={styles.sectionSub}>Small steps add up</Text></View><Text style={styles.overall}>{progress}% done</Text></View>
          {subjects.map(s => <View key={s.name} style={styles.subjectCard}>
            <View style={styles.subjectTop}><View style={[styles.subjectIcon,{backgroundColor:s.color+'22'}]}><View style={[styles.subjectDot,{backgroundColor:s.color}]}/></View><View style={{flex:1}}><Text style={styles.subjectName}>{s.name}</Text><Text style={styles.subjectMeta}>{s.completed} of {s.total} units completed</Text></View><Pressable onPress={()=>addChapter(s.name)} style={styles.plus}><Ionicons name="add" size={20} color={c.accent}/></Pressable></View>
            <View style={styles.track}><View style={[styles.fill,{backgroundColor:s.color,width:(s.completed/s.total*100)+'%'}]}/></View>
          </View>)}
          <Text style={styles.helper}>Tap + each time you finish a chapter or unit.</Text>
        </>}
        <View style={styles.footer}><Ionicons name="shield-checkmark-outline" size={15} color={c.muted}/><Text style={styles.footerText}>Your progress is saved on this device.</Text></View>
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={()=>setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <View style={styles.modalHead}><Text style={styles.modalTitle}>New task</Text><Pressable onPress={()=>setShowAdd(false)}><Ionicons name="close" size={22} color={c.text}/></Pressable></View>
            <Text style={styles.fieldLabel}>TASK NAME</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Revise chapter 3" placeholderTextColor={c.muted} style={styles.field} autoFocus/>
            <Text style={styles.fieldLabel}>SUBJECT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxHeight:42}}>{subjects.map(s=><Pressable key={s.name} onPress={()=>setSubject(s.name)} style={[styles.choice,subject===s.name&&styles.choiceActive]}><Text style={[styles.choiceText,subject===s.name&&styles.choiceTextActive]}>{s.name}</Text></Pressable>)}</ScrollView>
            <Text style={styles.fieldLabel}>DUE</Text>
            <View style={{flexDirection:'row',gap:8}}>{['Today','Tomorrow','This week'].map(d=><Pressable key={d} onPress={()=>setDue(d)} style={[styles.choice,due===d&&styles.choiceActive]}><Text style={[styles.choiceText,due===d&&styles.choiceTextActive]}>{d}</Text></Pressable>)}</View>
            <Pressable onPress={addTask} style={styles.saveButton}><Text style={styles.saveText}>Save task</Text></Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(c: any) {
  return StyleSheet.create({
    safe:{flex:1,backgroundColor:c.bg},top:{paddingHorizontal:22,paddingTop:10,paddingBottom:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
    eyebrow:{fontSize:10,fontWeight:'800',letterSpacing:2,color:c.muted},brand:{fontSize:27,fontWeight:'800',letterSpacing:-1.2,color:c.text,marginTop:2},dot:{color:c.accent},
    themeButton:{width:42,height:42,borderRadius:15,backgroundColor:c.panel,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:c.line},
    content:{paddingHorizontal:20,paddingBottom:36},greeting:{marginTop:8,marginBottom:20},hello:{fontSize:14,color:c.muted},heading:{fontSize:23,fontWeight:'800',letterSpacing:-.7,color:c.text,marginTop:3},
    datePill:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',backgroundColor:c.soft,paddingHorizontal:10,paddingVertical:7,borderRadius:9,marginTop:13},dateText:{fontSize:9,fontWeight:'800',letterSpacing:1,color:c.accent},
    stats:{flexDirection:'row',gap:12,marginBottom:23},statCard:{backgroundColor:c.panel,borderRadius:17,padding:16,borderWidth:1,borderColor:c.line,minHeight:115},
    statLabel:{fontSize:9,fontWeight:'800',letterSpacing:1.1,color:c.muted},statNumber:{fontSize:30,fontWeight:'800',color:c.text,marginTop:8},percent:{fontSize:12,fontWeight:'600',color:c.muted},
    track:{height:6,backgroundColor:c.line,borderRadius:10,overflow:'hidden',marginTop:12},fill:{height:6,backgroundColor:c.accent,borderRadius:10},statHint:{fontSize:11,color:c.muted,marginTop:4},
    tabs:{flexDirection:'row',backgroundColor:c.card,padding:4,borderRadius:13,marginBottom:23},tab:{flex:1,paddingVertical:10,alignItems:'center',borderRadius:10},activeTab:{backgroundColor:c.panel},tabText:{fontSize:13,fontWeight:'600',color:c.muted},activeTabText:{color:c.text,fontWeight:'800'},
    sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},sectionTitle:{fontSize:19,fontWeight:'800',color:c.text,letterSpacing:-.4},sectionSub:{fontSize:11,color:c.muted,marginTop:3},
    addButton:{flexDirection:'row',alignItems:'center',backgroundColor:c.accent,paddingHorizontal:12,paddingVertical:9,borderRadius:11},addText:{fontSize:11,fontWeight:'800',color:'#FFFFFF'},
    task:{backgroundColor:c.panel,borderWidth:1,borderColor:c.line,borderRadius:14,padding:14,marginBottom:9,flexDirection:'row',alignItems:'center',gap:11},check:{padding:1},taskTitle:{fontSize:13,fontWeight:'700',color:c.text},taskMeta:{fontSize:10,color:c.muted,marginTop:5},
    completedLabel:{fontSize:9,fontWeight:'800',letterSpacing:1.4,color:c.muted,marginTop:18,marginBottom:10},empty:{alignItems:'center',padding:28,backgroundColor:c.panel,borderWidth:1,borderColor:c.line,borderRadius:16},emptyTitle:{fontSize:15,fontWeight:'800',color:c.text,marginTop:9},muted:{fontSize:11,color:c.muted,marginTop:5},
    overall:{fontSize:12,fontWeight:'800',color:c.accent},subjectCard:{backgroundColor:c.panel,borderWidth:1,borderColor:c.line,borderRadius:15,padding:14,marginBottom:10},subjectTop:{flexDirection:'row',alignItems:'center',gap:11},
    subjectIcon:{width:35,height:35,borderRadius:11,alignItems:'center',justifyContent:'center'},subjectDot:{width:9,height:9,borderRadius:5},subjectName:{fontSize:13,fontWeight:'800',color:c.text},subjectMeta:{fontSize:10,color:c.muted,marginTop:4},
    plus:{width:32,height:32,borderRadius:10,backgroundColor:c.soft,alignItems:'center',justifyContent:'center'},helper:{fontSize:10,color:c.muted,marginTop:4},
    footer:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,marginTop:27,paddingTop:16,borderTopWidth:1,borderTopColor:c.line},footerText:{fontSize:10,color:c.muted},
    modalBackdrop:{flex:1,backgroundColor:'rgba(0,0,0,.5)',justifyContent:'flex-end'},modal:{backgroundColor:c.panel,borderTopLeftRadius:24,borderTopRightRadius:24,padding:22,paddingBottom:32},
    modalHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},modalTitle:{fontSize:20,fontWeight:'800',color:c.text},fieldLabel:{fontSize:9,fontWeight:'800',letterSpacing:1.2,color:c.muted,marginBottom:8,marginTop:13},
    field:{backgroundColor:c.input,borderRadius:12,paddingHorizontal:14,paddingVertical:13,color:c.text,fontSize:13,borderWidth:1,borderColor:c.line},choice:{paddingHorizontal:12,paddingVertical:10,borderRadius:10,backgroundColor:c.input,borderWidth:1,borderColor:c.line,marginRight:7},choiceActive:{backgroundColor:c.soft,borderColor:c.accent},choiceText:{fontSize:10,fontWeight:'600',color:c.muted},choiceTextActive:{color:c.accent,fontWeight:'800'},
    saveButton:{backgroundColor:c.accent,borderRadius:12,alignItems:'center',paddingVertical:14,marginTop:24},saveText:{color:'#FFFFFF',fontSize:13,fontWeight:'800'}
  });
}
