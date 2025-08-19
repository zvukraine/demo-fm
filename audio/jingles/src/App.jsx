import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Play, Pause, SkipForward, SkipBack, Volume2, Shuffle, Repeat, Moon, Sun, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import './App.css'

// Початковий плейлист з демонстраційними треками
const initialTracks = [
  {
    id: 1,
    title: "Ранковий джингл",
    artist: "Demo FM",
    duration: 15,
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    type: "jingle"
  },
  {
    id: 2,
    title: "Електронна композиція",
    artist: "Місцевий виконавець",
    duration: 180,
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    type: "track"
  },
  {
    id: 3,
    title: "Новини - джингл",
    artist: "Demo FM",
    duration: 10,
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    type: "jingle"
  },
  {
    id: 4,
    title: "Рок балада",
    artist: "Інді група",
    duration: 240,
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    type: "track"
  },
  {
    id: 5,
    title: "Реклама - джингл",
    artist: "Demo FM",
    duration: 30,
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    type: "jingle"
  },
  {
    id: 6,
    title: "Джаз імпровізація",
    artist: "Джаз квартет",
    duration: 200,
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    type: "track"
  },
  {
    id: 7,
    title: "Вечірній джингл",
    artist: "Demo FM",
    duration: 20,
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    type: "jingle"
  },
  {
    id: 8,
    title: "Поп хіт",
    artist: "Популярний виконавець",
    duration: 210,
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    type: "track"
  }
]

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function App() {
  const [tracks, setTracks] = useState(initialTracks)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([70])
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [editingTrack, setEditingTrack] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTrack, setNewTrack] = useState({
    title: '',
    artist: '',
    duration: 180,
    url: '',
    type: 'track'
  })
  const audioRef = useRef(null)

  const currentTrack = tracks[currentTrackIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0
        audio.play()
      } else {
        nextTrack()
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', handleEnded)
    audio.volume = volume[0] / 100

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrackIndex, volume, isRepeating])

  const togglePlay = () => {
    const audio = audioRef.current
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const nextTrack = () => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * tracks.length)
      setCurrentTrackIndex(randomIndex)
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
    }
    setCurrentTime(0)
  }

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
    setCurrentTime(0)
  }

  const handleSeek = (value) => {
    const audio = audioRef.current
    const newTime = (value[0] / 100) * currentTrack.duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value) => {
    setVolume(value)
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100
    }
  }

  const handleEditTrack = (track) => {
    setEditingTrack({ ...track })
  }

  const saveEditedTrack = () => {
    setTracks(tracks.map(track => 
      track.id === editingTrack.id ? editingTrack : track
    ))
    setEditingTrack(null)
  }

  const deleteTrack = (trackId) => {
    if (tracks.length <= 1) return // Не дозволяємо видалити останній трек
    
    const newTracks = tracks.filter(track => track.id !== trackId)
    setTracks(newTracks)
    
    // Якщо видаляємо поточний трек, переходимо до наступного
    if (tracks[currentTrackIndex].id === trackId) {
      setCurrentTrackIndex(0)
      setCurrentTime(0)
    }
  }

  const addNewTrack = () => {
    const track = {
      ...newTrack,
      id: Math.max(...tracks.map(t => t.id)) + 1
    }
    setTracks([...tracks, track])
    setNewTrack({
      title: '',
      artist: '',
      duration: 180,
      url: '',
      type: 'track'
    })
    setIsAddDialogOpen(false)
  }

  const progress = currentTrack ? (currentTime / currentTrack.duration) * 100 : 0

  const themeClasses = isDarkTheme 
    ? "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
    : "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white"

  const cardClasses = isDarkTheme
    ? "bg-gray-800/80 backdrop-blur-lg border-gray-600/30 text-white"
    : "bg-white/10 backdrop-blur-lg border-white/20 text-white"

  return (
    <div className={themeClasses}>
      <div className="max-w-4xl mx-auto p-4">
        {/* Заголовок з перемикачем теми */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2">📻 Demo FM</h1>
            <p className={isDarkTheme ? "text-gray-300" : "text-blue-200"}>
              Власні треки та джингли у безперервному циклі
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={isDarkTheme ? "border-gray-600 text-gray-300" : "border-white/30 text-white"}
          >
            {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Основний плеєр */}
        <Card className={cardClasses + " mb-6"}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{currentTrack?.title}</CardTitle>
            <CardDescription className={isDarkTheme ? "text-gray-400" : "text-blue-200"}>
              {currentTrack?.artist} • {currentTrack?.type === 'jingle' ? '🎵 Джингл' : '🎶 Трек'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Прогрес бар */}
            <div className="space-y-2">
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={1}
                className="w-full"
              />
              <div className={`flex justify-between text-sm ${isDarkTheme ? 'text-gray-400' : 'text-blue-200'}`}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack?.duration || 0)}</span>
              </div>
            </div>

            {/* Кнопки управління */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={isShuffled ? "default" : "outline"}
                size="icon"
                onClick={() => setIsShuffled(!isShuffled)}
                className={isDarkTheme ? "border-gray-600" : "border-white/30"}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={prevTrack}
                className={isDarkTheme ? "border-gray-600" : "border-white/30"}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                onClick={togglePlay}
                className={isDarkTheme ? "bg-gray-200 text-gray-900 hover:bg-gray-300" : "bg-white text-purple-900 hover:bg-white/90"}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextTrack}
                className={isDarkTheme ? "border-gray-600" : "border-white/30"}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              
              <Button
                variant={isRepeating ? "default" : "outline"}
                size="icon"
                onClick={() => setIsRepeating(!isRepeating)}
                className={isDarkTheme ? "border-gray-600" : "border-white/30"}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>

            {/* Гучність */}
            <div className="flex items-center space-x-3">
              <Volume2 className="h-5 w-5" />
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className={`text-sm w-12 ${isDarkTheme ? 'text-gray-400' : 'text-blue-200'}`}>
                {volume[0]}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Список треків з можливістю редагування */}
        <Card className={cardClasses}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Плейлист ({tracks.length} треків)</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={isDarkTheme ? "border-gray-600" : "border-white/30"}>
                  <Plus className="h-4 w-4 mr-2" />
                  Додати трек
                </Button>
              </DialogTrigger>
              <DialogContent className={isDarkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>
                <DialogHeader>
                  <DialogTitle>Додати новий трек</DialogTitle>
                  <DialogDescription>
                    Заповніть інформацію про новий трек або джингл
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Назва</Label>
                    <Input
                      id="title"
                      value={newTrack.title}
                      onChange={(e) => setNewTrack({...newTrack, title: e.target.value})}
                      placeholder="Назва треку"
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist">Виконавець</Label>
                    <Input
                      id="artist"
                      value={newTrack.artist}
                      onChange={(e) => setNewTrack({...newTrack, artist: e.target.value})}
                      placeholder="Ім'я виконавця"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Тривалість (секунди)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTrack.duration}
                      onChange={(e) => setNewTrack({...newTrack, duration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL файлу</Label>
                    <Input
                      id="url"
                      value={newTrack.url}
                      onChange={(e) => setNewTrack({...newTrack, url: e.target.value})}
                      placeholder="https://example.com/audio.mp3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Тип</Label>
                    <select
                      id="type"
                      value={newTrack.type}
                      onChange={(e) => setNewTrack({...newTrack, type: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="track">Трек</option>
                      <option value="jingle">Джингл</option>
                    </select>
                  </div>
                  <Button onClick={addNewTrack} className="w-full">
                    Додати трек
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    index === currentTrackIndex
                      ? (isDarkTheme ? 'bg-gray-700/50' : 'bg-white/20')
                      : (isDarkTheme ? 'hover:bg-gray-700/30' : 'hover:bg-white/10')
                  }`}
                >
                  {editingTrack && editingTrack.id === track.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editingTrack.title}
                        onChange={(e) => setEditingTrack({...editingTrack, title: e.target.value})}
                        className="mb-1"
                      />
                      <Input
                        value={editingTrack.artist}
                        onChange={(e) => setEditingTrack({...editingTrack, artist: e.target.value})}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={saveEditedTrack}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingTrack(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          setCurrentTrackIndex(index)
                          setCurrentTime(0)
                        }}
                      >
                        <div className="font-medium flex items-center">
                          {track.title}
                          {track.type === 'jingle' && <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded">Джингл</span>}
                        </div>
                        <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-blue-200'}`}>
                          {track.artist}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-blue-200'}`}>
                          {formatTime(track.duration)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTrack(track)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTrack(track.id)}
                          disabled={tracks.length <= 1}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Інформація про хостинг */}
        <Card className={cardClasses + " mt-6"}>
          <CardHeader>
            <CardTitle>💡 Рекомендації по хостингу аудіофайлів</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>GitHub Pages:</strong> Ідеально для коротких треків та джинглів (до 100 МБ на файл)
              </div>
              <div>
                <strong>Internet Archive:</strong> Для довших композицій, необмежений розмір
              </div>
              <div>
                <strong>Для Demo FM:</strong> Короткі треки + джингли = GitHub Pages буде ідеальним рішенням!
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Прихований аудіо елемент */}
        <audio
          ref={audioRef}
          src={currentTrack?.url}
          preload="metadata"
        />
      </div>
    </div>
  )
}

export default App

