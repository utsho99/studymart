import { useState } from 'react'

const GRADE_POINTS = {
  'A+': 4.00, 'A': 4.00, 'A-': 3.67,
  'B+': 3.33, 'B': 3.00, 'B-': 2.67,
  'C+': 2.33, 'C': 2.00, 'C-': 1.67,
  'D+': 1.33, 'D': 1.00, 'F': 0.00,
}

const GRADE_COLORS = {
  'A+': 'text-green-600', 'A': 'text-green-600', 'A-': 'text-green-500',
  'B+': 'text-blue-600', 'B': 'text-blue-500', 'B-': 'text-blue-400',
  'C+': 'text-yellow-600', 'C': 'text-yellow-500', 'C-': 'text-yellow-400',
  'D+': 'text-orange-500', 'D': 'text-orange-400', 'F': 'text-red-600',
}

export default function GPACalculator() {
  const [courses, setCourses] = useState([
    { id: 1, name: '', credits: '', grade: '' },
    { id: 2, name: '', credits: '', grade: '' },
    { id: 3, name: '', credits: '', grade: '' },
  ])
  const [tab, setTab] = useState('gpa') // gpa or cgpa
  const [cgpaCourses, setCgpaCourses] = useState([
    { id: 1, semester: 'Semester 1', gpa: '', credits: '' },
  ])

  const addCourse = () => setCourses(prev => [...prev, { id: Date.now(), name: '', credits: '', grade: '' }])
  const removeCourse = (id) => setCourses(prev => prev.filter(c => c.id !== id))
  const updateCourse = (id, field, value) => setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))

  const addSemester = () => setCgpaCourses(prev => [...prev, { id: Date.now(), semester: `Semester ${prev.length + 1}`, gpa: '', credits: '' }])
  const removeSemester = (id) => setCgpaCourses(prev => prev.filter(c => c.id !== id))
  const updateSemester = (id, field, value) => setCgpaCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))

  // Calculate GPA
  const validCourses = courses.filter(c => c.credits && c.grade && GRADE_POINTS[c.grade] !== undefined)
  const totalCredits = validCourses.reduce((sum, c) => sum + Number(c.credits), 0)
  const totalPoints = validCourses.reduce((sum, c) => sum + (Number(c.credits) * GRADE_POINTS[c.grade]), 0)
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0

  // Calculate CGPA
  const validSemesters = cgpaCourses.filter(c => c.gpa && c.credits)
  const cgpaTotalCredits = validSemesters.reduce((sum, c) => sum + Number(c.credits), 0)
  const cgpaTotalPoints = validSemesters.reduce((sum, c) => sum + (Number(c.gpa) * Number(c.credits)), 0)
  const cgpa = cgpaTotalCredits > 0 ? (cgpaTotalPoints / cgpaTotalCredits) : 0

  const getResultColor = (val) => {
    if (val >= 3.5) return 'text-green-600'
    if (val >= 3.0) return 'text-blue-600'
    if (val >= 2.5) return 'text-yellow-600'
    if (val >= 2.0) return 'text-orange-500'
    return 'text-red-600'
  }

  const getResultLabel = (val) => {
    if (val >= 3.7) return 'Excellent! 🏆'
    if (val >= 3.3) return 'Very Good! 🌟'
    if (val >= 3.0) return 'Good 👍'
    if (val >= 2.5) return 'Average'
    if (val >= 2.0) return 'Below Average'
    return 'Need Improvement'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-1">GPA / CGPA Calculator</h1>
        <p className="text-indigo-100 text-sm">Calculate your semester GPA or cumulative CGPA</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button onClick={() => setTab('gpa')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'gpa' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Semester GPA
        </button>
        <button onClick={() => setTab('cgpa')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'cgpa' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Cumulative CGPA
        </button>
      </div>

      {tab === 'gpa' && (
        <div className="space-y-4">
          {/* Result */}
          {totalCredits > 0 && (
            <div className="card p-5 text-center bg-gradient-to-br from-gray-50 to-white">
              <p className="text-sm text-gray-500 mb-1">Your GPA</p>
              <p className={`text-6xl font-black mb-2 ${getResultColor(gpa)}`}>{gpa.toFixed(2)}</p>
              <p className="text-sm font-medium text-gray-600">{getResultLabel(gpa)}</p>
              <p className="text-xs text-gray-400 mt-1">Based on {totalCredits} credit hours</p>
            </div>
          )}

          {/* Courses */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Courses</h2>
              <button onClick={addCourse} className="text-sm text-blue-600 font-medium hover:underline">+ Add Course</button>
            </div>

            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-5">Course Name</div>
              <div className="col-span-3">Credits</div>
              <div className="col-span-3">Grade</div>
              <div className="col-span-1"></div>
            </div>

            {courses.map((course, idx) => (
              <div key={course.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <input className="input text-sm py-2" value={course.name}
                    onChange={e => updateCourse(course.id, 'name', e.target.value)}
                    placeholder={`Course ${idx + 1}`} />
                </div>
                <div className="col-span-3">
                  <input type="number" className="input text-sm py-2" value={course.credits}
                    onChange={e => updateCourse(course.id, 'credits', e.target.value)}
                    placeholder="3" min="0" max="6" step="0.5" />
                </div>
                <div className="col-span-3">
                  <select className={`input text-sm py-2 font-semibold ${GRADE_COLORS[course.grade] || 'text-gray-700'}`}
                    value={course.grade} onChange={e => updateCourse(course.id, 'grade', e.target.value)}>
                    <option value="">Grade</option>
                    {Object.keys(GRADE_POINTS).map(g => (
                      <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 flex justify-center">
                  {courses.length > 1 && (
                    <button onClick={() => removeCourse(course.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Grade reference */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Grade Points Reference</h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(GRADE_POINTS).map(([grade, point]) => (
                <div key={grade} className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className={`font-bold text-sm ${GRADE_COLORS[grade]}`}>{grade}</p>
                  <p className="text-xs text-gray-500">{point.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'cgpa' && (
        <div className="space-y-4">
          {/* Result */}
          {cgpaTotalCredits > 0 && (
            <div className="card p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Your CGPA</p>
              <p className={`text-6xl font-black mb-2 ${getResultColor(cgpa)}`}>{cgpa.toFixed(2)}</p>
              <p className="text-sm font-medium text-gray-600">{getResultLabel(cgpa)}</p>
              <p className="text-xs text-gray-400 mt-1">Based on {cgpaTotalCredits} total credit hours</p>
            </div>
          )}

          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Semesters</h2>
              <button onClick={addSemester} className="text-sm text-blue-600 font-medium hover:underline">+ Add Semester</button>
            </div>

            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-5">Semester</div>
              <div className="col-span-3">GPA</div>
              <div className="col-span-3">Credits</div>
              <div className="col-span-1"></div>
            </div>

            {cgpaCourses.map((sem, idx) => (
              <div key={sem.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <input className="input text-sm py-2" value={sem.semester}
                    onChange={e => updateSemester(sem.id, 'semester', e.target.value)}
                    placeholder={`Semester ${idx + 1}`} />
                </div>
                <div className="col-span-3">
                  <input type="number" className="input text-sm py-2" value={sem.gpa}
                    onChange={e => updateSemester(sem.id, 'gpa', e.target.value)}
                    placeholder="3.50" min="0" max="4" step="0.01" />
                </div>
                <div className="col-span-3">
                  <input type="number" className="input text-sm py-2" value={sem.credits}
                    onChange={e => updateSemester(sem.id, 'credits', e.target.value)}
                    placeholder="18" min="0" />
                </div>
                <div className="col-span-1 flex justify-center">
                  {cgpaCourses.length > 1 && (
                    <button onClick={() => removeSemester(sem.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
