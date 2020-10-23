import React, { Component } from 'react';
import { Grid, Checkbox, Box } from '@material-ui/core';
import * as d3 from 'd3';
import styled from 'styled-components';
import { MapInteractionCSS } from 'react-map-interaction';

// import ZoomInIcon from '@material-ui/icons/ZoomIn';
// import ZoomOutIcon from '@material-ui/icons/ZoomOut';

import CourseHeaderItem from './CourseHeaderItem';
import CourseHeaderItemAll from './CourseHeaderItemAll';
import { getGeneratedGradingData } from './FakeStudentScoreGenerator';
import { HeaderOptions, SortOrder } from './SortOptions.enum';

import { ReactComponent as RoadBlockIcon } from '../../icons/roadblock.svg';
import { ReactComponent as AscendingHorizontalIcon } from '../../icons/ascending-horizontal.svg';
import { ReactComponent as DescendingHorizontalIcon } from '../../icons/descending-horizontal.svg';

const HeaderLabel = styled.div`
  align-self: flex-end;
  color: #cc0000;
  font-weight: bold;
  font-size: 10px;
  padding-top: ${(props) => (props.checkbox ? '0px' : '2px')};
  width: ${(props) => props.width}px;
  min-width: ${(props) => props.minWidth}px;
  height: 20px;
  display: flex;
  justify-content: center;
  margin: 1px 0px;
`;

const colorNoteValues = ['[Excellent] More than 85', '[Good] >= 70 and < 85', '[Average] >= 50 and < 70', '[Poor] Less than 50'];
const colorLegends = d3.scaleOrdinal().domain(colorNoteValues).range(['#174568', '#2E8AD0', '#8DB8D9', '#D9D9D9']);

const getBackgroundColor = d3.scaleThreshold().domain([50, 70, 85, 100]).range(['#D9D9D9', '#8DB8D9', '#2E8AD0', '#174568']);
// const getFontColor = d3.scaleLinear().domain([49.9, 50]).range(['#000000', '#FFFFFF']).clamp(true);
const getFontColor = d3.scaleThreshold().domain([50, 70, 85, 100]).range(['#808080', '#FFFFFF', '#FFFFFF', '#FFFFFF']);

class StatisticsGrading extends Component {
  constructor(props) {
    console.log('INIT');
    super(props);
    this.state = {
      allStudents: {},
      allStudentIds: [],
      allCourses: {},
      allCourseIds: [],

      allSortHeaders: {
        GPA: {
          order: SortOrder.DESC,
        },
        AVE_SCORE: {
          order: null,
        },
        TOP_STUDENT_SCORE: {
          order: null,
          courseId: null,
        },
        TOP_COURSE_BY_STUDENT: {
          order: null,
          studentId: null,
        },
      },

      selectedCourses: [],
      selectedSortCourse: null,
      selectedStudents: [],
      selectedHeader: HeaderOptions.GPA,
      sortOrder: SortOrder.DESC,
    };
  }
  componentDidMount() {
    console.log('DID MOUNT');
    const generatedGradingData = getGeneratedGradingData();

    let allCourses = generatedGradingData.allCourses,
      allCourseIds = generatedGradingData.allCourseIds,
      allStudents = generatedGradingData.allStudents,
      allStudentIds = generatedGradingData.allStudentIds;

    //sort by gpa by default before render
    allStudentIds.sort((prevStudentId, currentStudentId) => {
      const prevGPA = allStudents[prevStudentId].gpa;
      const currentGPA = allStudents[currentStudentId].gpa;
      return currentGPA - prevGPA || isNaN(prevGPA) - isNaN(currentGPA);
    });
    // allStudentIds.sort((prevStudentId, currentStudentId) => {
    //   return allStudents[currentStudentId].fullName.localeCompare(allStudents[currentStudentId].fullName);
    // });
    // allStudentIds.forEach(studentId => console.log(allStudents[studentId].fullName))

    this.setState(
      {
        allCourses,
        allCourseIds,
        allStudents,
        allStudentIds,
      },
      () => console.log(this.state)
    );
  }

  _sortGPA(newOrder) {
    const { allStudents, allStudentIds, allSortHeaders } = this.state;
    allSortHeaders.TOP_STUDENT_SCORE.courseId = null;
    allSortHeaders.TOP_STUDENT_SCORE.order = null;
    allSortHeaders.GPA.order = newOrder;
    if (newOrder === SortOrder.ASC) {
      allStudentIds.sort((prevStudentId, currentStudentId) => {
        const prevGPA = allStudents[prevStudentId].gpa;
        const currentGPA = allStudents[currentStudentId].gpa;
        return prevGPA - currentGPA || isNaN(prevGPA) - isNaN(currentGPA);
      });
    } else {
      allStudentIds.sort((prevStudentId, currentStudentId) => {
        const prevGPA = allStudents[prevStudentId].gpa;
        const currentGPA = allStudents[currentStudentId].gpa;
        return currentGPA - prevGPA || isNaN(prevGPA) - isNaN(currentGPA);
      });
    }
    this.setState({
      allStudentIds,
      allSortHeaders,
    });
  }

  _sortAverageScore(newOrder) {
    const { allStudentIds, allSortHeaders, allCourseIds, allCourses } = this.state;
    allSortHeaders.TOP_COURSE_BY_STUDENT.studentId = null;
    allSortHeaders.TOP_COURSE_BY_STUDENT.order = null;
    allSortHeaders.AVE_SCORE.order = newOrder;
    if (newOrder === SortOrder.ASC) {
      allCourseIds.sort((prevCourseId, currentCourseId) => {
        return allCourses[currentCourseId].averageScore <= allCourses[prevCourseId].averageScore ? 1 : -1;
      });
    } else {
      allCourseIds.sort((prevCourseId, currentCourseId) => {
        return allCourses[currentCourseId].averageScore >= allCourses[prevCourseId].averageScore ? 1 : -1;
      });
    }
    this.setState({
      allStudentIds,
      allSortHeaders,
    });
  }

  _sortScoreByOneCourse(newSelectedId, order) {
    const { allStudents, allStudentIds, allSortHeaders } = this.state;
    allSortHeaders.GPA.order = null;
    allSortHeaders.TOP_STUDENT_SCORE.order = allSortHeaders.TOP_STUDENT_SCORE.courseId !== newSelectedId ? SortOrder.DESC : order;
    allSortHeaders.TOP_STUDENT_SCORE.courseId = newSelectedId;

    if (allSortHeaders.TOP_STUDENT_SCORE.order === SortOrder.ASC) {
      allStudentIds.sort((prevStudentId, currentStudentId) => {
        const prevScore = allStudents[prevStudentId].courses[newSelectedId];
        const currentScore = allStudents[currentStudentId].courses[newSelectedId];
        return prevScore - currentScore || isNaN(prevScore) - isNaN(currentScore);
      });
    } else {
      allStudentIds.sort((prevStudentId, currentStudentId) => {
        const prevScore = allStudents[prevStudentId].courses[newSelectedId];
        const currentScore = allStudents[currentStudentId].courses[newSelectedId];
        return currentScore - prevScore || isNaN(prevScore) - isNaN(currentScore);
      });
    }

    this.setState({
      allStudentIds,
      allSortHeaders,
    });
  }

  _sortTopCourseByOneStudent(newSelectedId, order) {
    const { allCourseIds, allStudents, allStudentIds, allSortHeaders } = this.state;
    allSortHeaders.AVE_SCORE.order = null;
    allSortHeaders.TOP_COURSE_BY_STUDENT.order = allSortHeaders.TOP_COURSE_BY_STUDENT.studentId !== newSelectedId ? SortOrder.DESC : order;
    allSortHeaders.TOP_COURSE_BY_STUDENT.studentId = newSelectedId;

    if (allSortHeaders.TOP_COURSE_BY_STUDENT.order === SortOrder.ASC) {
      allCourseIds.sort((prevCourseId, currentCourseId) => {
        const prevScore = allStudents[newSelectedId].courses[prevCourseId];
        const currentScore = allStudents[newSelectedId].courses[currentCourseId];
        return prevScore - currentScore || isNaN(prevScore) - isNaN(currentScore);
      });
    } else {
      allCourseIds.sort((prevCourseId, currentCourseId) => {
        const prevScore = allStudents[newSelectedId].courses[prevCourseId];
        const currentScore = allStudents[newSelectedId].courses[currentCourseId];
        return currentScore - prevScore || isNaN(prevScore) - isNaN(currentScore);
      });
    }

    this.setState({
      allStudentIds,
      allSortHeaders,
    });
  }

  render() {
    console.log('RENDER');
    console.log('PROPS', this.props);
    console.log('STATE', this.state);
    const { allCourses, allCourseIds, allStudents, allStudentIds, selectedHeader, allSortHeaders } = this.state;

    return (
      <div style={{ height: '100vh' }}>
        <Grid container>
          <Grid item lg={2} style={{ backgroundColor: 'whitesmoke', padding: '40px', height: '100vh' }}>
            {/* Search and filter panel */}
            <Box display="flex" flexDirection="column" justifyContent="center">
              <RoadBlockIcon style={{ width: '40px', height: '40px', fill: 'grey', display: 'block', margin: 'auto' }} />
              <div>This page is under development</div>
            </Box>
          </Grid>
          <Grid item lg={10} style={{ padding: '40px', fontSize: '10px', backgroundColor: '#525659', height: '100vh' }}>
            <div
              style={{
                overflowX: 'auto',
                backgroundColor: 'white',
                height: '100%',
                boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.2), 0px 6px 20px 0px rgba(0, 0, 0, 0.19)',
              }}
            >
              <MapInteractionCSS minScale={0.25} maxScale={3.0} defaultValue={{ scale: 1.0, translation: { x: 100, y: 100 } }}>
                {/* header */}
                <Box display="flex" flexWrap="nowrap" margin={'1px 1px 1px 1px'}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '178px', fontSize: '16px' }}>
                      <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Note</div>
                      <div style={{ padding: '10px 0px', fontSize: '14px' }}>
                        {colorNoteValues.map((value) => (
                          <div style={{ display: 'flex', alignItems: 'center', margin: '0px 0px 1px 0px' }} key={value}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: colorLegends(value) }}></div>
                            <div style={{ padding: '0px 5px' }}>{value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontWeight: 'bold' }}>
                        <div>Total students: {allStudentIds.length}</div>
                        <div>Total courses: {allCourseIds.length}</div>
                      </div>
                    </div>
                    <div
                      style={{
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        color: '#cc0000',
                        fontWeight: 'bold',
                        margin: '1px 0px',
                      }}
                    >
                      Average score
                    </div>
                    <div style={{ height: '20px', display: 'flex', margin: '5px 0px -5px 0px', alignItems: 'center' }}>
                      <HeaderLabel width={30} minWidth={30}>
                        No.
                      </HeaderLabel>
                      <HeaderLabel width={20} minWidth={20} checkbox>
                        <Checkbox defaultChecked={true} style={{ color: '#007FFF', margin: '0px', padding: '0px' }} size="small" />
                      </HeaderLabel>
                      <HeaderLabel width={200} minWidth={200}>
                        Fullname
                      </HeaderLabel>
                      <HeaderLabel width={20} minWidth={20}>
                        GPA
                      </HeaderLabel>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignSelf: 'flex-end', paddingTop: '50px' }}>
                    <CourseHeaderItemAll
                      isSelected={true}
                      selectedHeader={selectedHeader}
                      sortGPAOrder={allSortHeaders.GPA.order}
                      sortAverageScoreOrder={allSortHeaders.AVE_SCORE.order}
                      onSortGPA={(order) => this._sortGPA(order)}
                      onSortAverageScore={(order) => this._sortAverageScore(order)}
                    />
                    {allCourseIds.map((courseId, courseIndex) => (
                      <CourseHeaderItem
                        key={courseId}
                        id={courseId}
                        index={courseIndex + 1}
                        name={allCourses[courseId].name}
                        averageScore={allCourses[courseId].averageScore}
                        color={getFontColor(allCourses[courseId].averageScore)}
                        backgroundColor={getBackgroundColor(allCourses[courseId].averageScore)}
                        isSelected={true}
                        sortScoreOrder={allSortHeaders.TOP_STUDENT_SCORE.order}
                        selectedSortId={allSortHeaders.TOP_STUDENT_SCORE.courseId === courseId ? allSortHeaders.TOP_STUDENT_SCORE.courseId : null}
                        onSortScore={(selectedId, order) => this._sortScoreByOneCourse(selectedId, order)}
                      />
                    ))}
                  </div>
                </Box>
                {/* item list */}
                <Box>
                  {/* Item detail */}
                  {allStudentIds.map((studentId, studentIndex) => (
                    <Box
                      key={studentIndex}
                      display="flex"
                      flexWrap="nowrap"
                      height={21}
                      alignItems="center"
                      margin={`${(studentIndex + 1) % 5 === 1 ? 10 : 1}px 1px ${(studentIndex + 1) % 5 === 0 ? 10 : 1}px 1px`}
                      fontSize="10px"
                    >
                      <div style={{ fontWeight: 'bold', width: '30px', minWidth: '30px', textAlign: 'right', justifyContent: 'flex-end' }}>
                        {studentIndex + 1}
                      </div>
                      <div style={{ width: '20px', minWidth: '20px' }}>
                        <Checkbox defaultChecked={true} style={{ color: '#007FFF', margin: '0px', padding: '0px' }} size="small" />
                      </div>
                      <div
                        style={{
                          fontWeight: 'bold',
                          width: '200px',
                          minWidth: '200px',
                          padding: '0px 5px',
                          display: 'inline-flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {allStudents[studentId].fullName}
                      </div>
                      <div
                        style={{
                          width: '20px',
                          minWidth: '20px',
                          height: '20px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: getBackgroundColor(allStudents[studentId].gpa),
                          color: getFontColor(allStudents[studentId].gpa),
                        }}
                      >
                        {!isNaN(allStudents[studentId].gpa) ? allStudents[studentId].gpa : ''}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '20px',
                          minWidth: '20px',
                          height: '20px',
                          margin: '1px 0px 1px 5px',
                          cursor: isNaN(allStudents[studentId].gpa) ? 'auto' : 'pointer',
                        }}
                        onClick={() => {
                          if (isNaN(allStudents[studentId].gpa)) return;
                          this._sortTopCourseByOneStudent(
                            studentId,
                            allSortHeaders.TOP_COURSE_BY_STUDENT.order === SortOrder.ASC || !allSortHeaders.TOP_COURSE_BY_STUDENT.order
                              ? SortOrder.DESC
                              : SortOrder.ASC
                          );
                        }}
                      >
                        {allSortHeaders.TOP_COURSE_BY_STUDENT.studentId === studentId && allSortHeaders.TOP_COURSE_BY_STUDENT.order === SortOrder.ASC ? (
                          <AscendingHorizontalIcon />
                        ) : allSortHeaders.TOP_COURSE_BY_STUDENT.studentId === studentId && allSortHeaders.TOP_COURSE_BY_STUDENT.order === SortOrder.DESC ? (
                          <DescendingHorizontalIcon />
                        ) : !isNaN(allStudents[studentId].gpa) ? (
                          <svg width="20px" height="20px" fill="#CCCCCC">
                            <circle r={3} cx={10} cy={10} />
                          </svg>
                        ) : (
                          ''
                        )}
                      </div>
                      {allCourseIds.map((courseId, courseIndex) => (
                        <div
                          key={courseId}
                          style={{
                            width: '20px',
                            minWidth: '20px',
                            height: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: !isNaN(allStudents[studentId].courses[courseId])
                              ? getBackgroundColor(allStudents[studentId].courses[courseId])
                              : 'white',
                            color: !isNaN(allStudents[studentId].courses[courseId]) ? getFontColor(allStudents[studentId].courses[courseId]) : 'black',
                            margin: `1px ${(courseIndex + 1) % 5 === 0 ? 5 : 1}px 1px ${(courseIndex + 1) % 5 === 1 ? 5 : 1}px`,
                          }}
                        >
                          {allStudents[studentId].courses[courseId] ?? ''}
                        </div>
                      ))}
                    </Box>
                  ))}
                </Box>
              </MapInteractionCSS>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default StatisticsGrading;
