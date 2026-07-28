"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, Droplets, Wind, Thermometer } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function WeatherApp() {
  const [city, setCity] = useState("Tokyo")
  const [searchInput, setSearchInput] = useState("")
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchWeather(city)
  }, [city])

  const fetchWeather = async (cityName: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setWeather(null)
      } else {
        setWeather(data)
        setError("")
      }
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.")
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setCity(searchInput)
      setSearchInput("")
    }
  }

  const getWeatherType = () => {
    if (!weather) return "default"

    const id = weather.weather[0].id
    if (id >= 200 && id < 300) return "thunderstorm"
    if (id >= 300 && id < 400) return "drizzle"
    if (id >= 500 && id < 600) return "rain"
    if (id >= 600 && id < 700) return "snow"
    if (id >= 700 && id < 800) return "atmosphere"
    if (id === 800) return "clear"
    if (id > 800) return "clouds"

    return "default"
  }

  const getTimeOfDay = () => {
    if (!weather) return "day"

    const sunrise = weather.sys.sunrise * 1000
    const sunset = weather.sys.sunset * 1000
    const now = Date.now()

    return now > sunrise && now < sunset ? "day" : "night"
  }

  const getBackgroundColor = () => {
    const weatherType = getWeatherType()
    const timeOfDay = getTimeOfDay()

    if (timeOfDay === "night") {
      return "bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950"
    }

    switch (weatherType) {
      case "clear":
        return "bg-gradient-to-b from-sky-500 to-blue-600"
      case "clouds":
        return "bg-gradient-to-b from-blue-400 to-slate-600"
      case "rain":
      case "drizzle":
        return "bg-gradient-to-b from-slate-700 to-gray-900"
      case "thunderstorm":
        return "bg-gradient-to-b from-gray-800 to-black"
      case "snow":
        return "bg-gradient-to-b from-blue-200 to-slate-400"
      default:
        return "bg-gradient-to-b from-blue-500 to-indigo-700"
    }
  }

  const getCharacterImage = () => {
    const weatherType = getWeatherType()
    const timeOfDay = getTimeOfDay()

    switch (weatherType) {
      case "clear":
        return timeOfDay === "day" ? "/images/sunny-character.png" : "/images/night-character.png"
      case "clouds":
        return "/images/cloudy-character.png"
      case "rain":
      case "drizzle":
        return "/images/rain-character.png"
      case "thunderstorm":
        return "/images/thunder-character.png"
      case "snow":
        return "/images/snow-character.png"
      default:
        return "/images/default-character.png"
    }
  }

  const getBackgroundImage = () => {
    return `url('${getCharacterImage()}')`
  }

  const getWeatherAnimation = () => {
    const weatherType = getWeatherType()

    switch (weatherType) {
      case "rain":
      case "drizzle":
        return <RainAnimation />
      case "snow":
        return <SnowAnimation />
      case "thunderstorm":
        return <ThunderAnimation />
      default:
        return null
    }
  }

  return (
    <div className={`relative min-h-screen flex flex-col items-center transition-colors duration-1000 overflow-hidden ${getBackgroundColor()}`}>
      {/* Background Layer: Soft Blur, Better Opacity, Full Center Cover */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105 filter blur-[2px] opacity-60 mix-blend-soft-light"
        style={{ backgroundImage: getBackgroundImage() }}
      />

      {/* Main Content Layer */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {getWeatherAnimation()}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container max-w-4xl mx-auto px-4 py-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
            Anime Weather
          </h1>

          <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl mx-auto">
            <Input
              type="text"
              placeholder="Search city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-white/20 backdrop-blur-md border-none text-white placeholder:text-white/70"
            />
            <Button type="submit" variant="secondary" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-20"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-white bg-red-500/20 backdrop-blur-md rounded-lg p-4"
              >
                {error}
              </motion.div>
            ) : weather ? (
              <motion.div
                key="weather"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                {/* Character/Scene Display Container - Centered and Properly Fitted */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/20 backdrop-blur-sm"
                >
                  <img
                    src={getCharacterImage()}
                    alt="Anime scene"
                    className="w-full h-full object-cover object-center"
                  />
                </motion.div>

                {/* Weather Info Cards */}
                <div className="flex flex-col gap-4">
                  <Card className="bg-white/15 backdrop-blur-md border-white/10 text-white overflow-hidden shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <MapPin className="mr-2 h-5 w-5 text-white/80" />
                        <h2 className="text-2xl font-bold">
                          {weather.name}, {weather.sys.country}
                        </h2>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center">
                          <img
                            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                            alt={weather.weather[0].description}
                            className="h-20 w-20"
                          />
                          <p className="text-lg capitalize">{weather.weather[0].description}</p>
                        </div>

                        <div className="text-right">
                          <h3 className="text-5xl font-bold">{Math.round(weather.main.temp)}°C</h3>
                          <p className="text-sm opacity-80">Feels like {Math.round(weather.main.feels_like)}°C</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white/15 backdrop-blur-md border-white/10 text-white shadow-lg">
                      <CardContent className="p-4 flex items-center">
                        <Droplets className="mr-2 h-5 w-5 text-white/80" />
                        <div>
                          <p className="text-sm opacity-80">Humidity</p>
                          <p className="text-xl font-semibold">{weather.main.humidity}%</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/15 backdrop-blur-md border-white/10 text-white shadow-lg">
                      <CardContent className="p-4 flex items-center">
                        <Wind className="mr-2 h-5 w-5 text-white/80" />
                        <div>
                          <p className="text-sm opacity-80">Wind</p>
                          <p className="text-xl font-semibold">{Math.round(weather.wind.speed * 3.6)} km/h</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/15 backdrop-blur-md border-white/10 text-white shadow-lg">
                      <CardContent className="p-4 flex items-center">
                        <Thermometer className="mr-2 h-5 w-5 text-white/80" />
                        <div>
                          <p className="text-sm opacity-80">Min Temp</p>
                          <p className="text-xl font-semibold">{Math.round(weather.main.temp_min)}°C</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/15 backdrop-blur-md border-white/10 text-white shadow-lg">
                      <CardContent className="p-4 flex items-center">
                        <Thermometer className="mr-2 h-5 w-5 text-white/80" />
                        <div>
                          <p className="text-sm opacity-80">Max Temp</p>
                          <p className="text-xl font-semibold">{Math.round(weather.main.temp_max)}°C</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function RainAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 w-0.5 h-10 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.4 + 0.1,
            height: `${Math.random() * 20 + 10}px`,
          }}
          animate={{
            y: ["0vh", "100vh"],
          }}
          transition={{
            duration: Math.random() * 1 + 0.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

function SnowAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.3,
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
          }}
          animate={{
            y: ["0vh", "100vh"],
            x: [`${Math.random() * 10 - 5}px`, `${Math.random() * 100 - 50}px`, `${Math.random() * 10 - 5}px`],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

function ThunderAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <RainAnimation />
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.4, 0.7, 0] }}
          transition={{
            duration: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: Math.random() * 10 + 5,
          }}
        />
      ))}
    </div>
  )
}