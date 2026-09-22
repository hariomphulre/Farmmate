import React, { useState } from 'react';
import { Calendar, Clock, MapPin, FileText, Send, CheckCircle } from 'lucide-react';

const EventManagement = () => {
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        eventStartDate: '',
        eventEndDate: '',
        startTime: '',
        endTime: '',
        location: '',
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        
        try {
            const res = await fetch("http://localhost:5000/api/trader/event-schedule", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(eventForm)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setSubmitStatus({ type: 'success', message: data.message || 'Event created successfully!' });
                setEventForm({
                    title: '',
                    description: '',
                    eventStartDate: '',
                    eventEndDate: '',
                    startTime: '',
                    endTime: '',
                    location: '',
                });
            } else {
                setSubmitStatus({ type: 'error', message: data.message || 'Failed to create event' });
            }
        } catch (error) {
            console.error("Error submitting event form", error);
            setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setEventForm({ ...eventForm, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
                        Event Management
                    </h1>
                    <p className="text-gray-600 text-lg">Create and schedule your events with ease</p>
                </div>

                {/* Status Messages */}
                {submitStatus && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        submitStatus.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-800' 
                            : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                        {submitStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        <span>{submitStatus.message}</span>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <FileText className="w-6 h-6" />
                            Event Details
                        </h2>
                    </div>
                    
                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Event Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={eventForm.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                    placeholder="Enter event title"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={eventForm.description}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 resize-none"
                                    placeholder="Describe your event"
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="eventStartDate"
                                    value={eventForm.eventStartDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="eventEndDate"
                                    value={eventForm.eventEndDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                />
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-green-600" />
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={eventForm.startTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                />
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-green-600" />
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={eventForm.endTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                />
                            </div>

                            {/* Location */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={eventForm.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                    placeholder="Enter event location"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                                    isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating Event...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Create Event
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-500">
                        Make your events memorable and well-organized
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventManagement;