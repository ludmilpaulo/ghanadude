'use client'

import { useState, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { setBrandLogo, setCustomDesign, setBrandLogoQty, setCustomDesignQty, clearDesign } from '@/redux/slices/designSlice'
import { Trash2, Plus, Minus, Palette, Image as ImageIcon } from 'lucide-react'

export default function CustomizePage() {
  const dispatch = useAppDispatch()
  const { brandLogo, customDesign, brandLogoQty, customDesignQty } = useAppSelector((state) => state.design)
  
  const [activeTab, setActiveTab] = useState<'logo' | 'design'>('logo')
  const [previewMode, setPreviewMode] = useState<'front' | 'back'>('front')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (type: 'logo' | 'design') => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const result = event.target?.result as string
            if (type === 'logo') {
              dispatch(setBrandLogo(result))
            } else {
              dispatch(setCustomDesign(result))
            }
          }
          reader.readAsDataURL(file)
        }
      }
      fileInputRef.current.click()
    }
  }

  const handleQuantityChange = (type: 'logo' | 'design', delta: number) => {
    if (type === 'logo') {
      dispatch(setBrandLogoQty(Math.max(0, brandLogoQty + delta)))
    } else {
      dispatch(setCustomDesignQty(Math.max(0, customDesignQty + delta)))
    }
  }

  const handleRemoveDesign = (type: 'logo' | 'design') => {
    if (type === 'logo') {
      dispatch(setBrandLogo(null))
      dispatch(setBrandLogoQty(0))
    } else {
      dispatch(setCustomDesign(null))
      dispatch(setCustomDesignQty(0))
    }
  }

  const handleClearAll = () => {
    dispatch(clearDesign())
  }

  const calculateTotal = () => {
    return (brandLogoQty * 50) + (customDesignQty * 100) // Pricing: Logo R50, Custom Design R100
  }

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Customize Your Products</h1>
          <p className="text-gray-600">Add your brand logo or create custom designs for your clothing</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Design Tools */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex border-b mb-6">
              <button
                onClick={() => setActiveTab('logo')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  activeTab === 'logo'
                    ? 'border-b-2 border-brand-600 text-brand-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Brand Logo
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  activeTab === 'design'
                    ? 'border-b-2 border-brand-600 text-brand-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Custom Design
              </button>
            </div>

            {activeTab === 'logo' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Upload Brand Logo</h3>
                  
                  {!brandLogo ? (
                    <div
                      onClick={() => handleFileUpload('logo')}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-500 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">Click to upload your logo</p>
                      <p className="text-sm text-gray-500">PNG, JPG, SVG up to 10MB</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={brandLogo}
                          alt="Brand Logo"
                          className="w-full h-48 object-contain bg-gray-50 rounded-xl"
                        />
                        <button
                          onClick={() => handleRemoveDesign('logo')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Quantity:</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange('logo', -1)}
                            className="p-2 rounded-full border hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{brandLogoQty}</span>
                          <button
                            onClick={() => handleQuantityChange('logo', 1)}
                            className="p-2 rounded-full border hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm text-gray-500">R50 per item</span>
                        <p className="font-semibold">Total: R{brandLogoQty * 50}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Create Custom Design</h3>
                  
                  {!customDesign ? (
                    <div
                      onClick={() => handleFileUpload('design')}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-500 transition-colors cursor-pointer"
                    >
                      <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">Click to upload your design</p>
                      <p className="text-sm text-gray-500">PNG, JPG, SVG up to 10MB</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={customDesign}
                          alt="Custom Design"
                          className="w-full h-48 object-contain bg-gray-50 rounded-xl"
                        />
                        <button
                          onClick={() => handleRemoveDesign('design')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Quantity:</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange('design', -1)}
                            className="p-2 rounded-full border hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{customDesignQty}</span>
                          <button
                            onClick={() => handleQuantityChange('design', 1)}
                            className="p-2 rounded-full border hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm text-gray-500">R100 per item</span>
                        <p className="font-semibold">Total: R{customDesignQty * 100}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
            />

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleClearAll}
                className="w-full py-3 px-4 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              >
                Clear All Designs
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Preview</h3>
              <div className="flex border rounded-xl">
                <button
                  onClick={() => setPreviewMode('front')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-xl ${
                    previewMode === 'front'
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setPreviewMode('back')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-xl ${
                    previewMode === 'back'
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-100 rounded-xl p-8 text-center">
                <div className="w-full h-80 bg-white rounded-lg shadow-sm relative overflow-hidden">
                  {/* T-shirt template */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-40 bg-gray-200 rounded-lg"></div>
                  </div>
                  
                  {/* Logo placement */}
                  {brandLogo && previewMode === 'front' && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                      <img
                        src={brandLogo}
                        alt="Logo Preview"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Custom design placement */}
                  {customDesign && previewMode === 'back' && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                      <img
                        src={customDesign}
                        alt="Design Preview"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-4">Order Summary</h4>
              <div className="space-y-2">
                {brandLogoQty > 0 && (
                  <div className="flex justify-between">
                    <span>Brand Logo ({brandLogoQty}x)</span>
                    <span>R{brandLogoQty * 50}</span>
                  </div>
                )}
                {customDesignQty > 0 && (
                  <div className="flex justify-between">
                    <span>Custom Design ({customDesignQty}x)</span>
                    <span>R{customDesignQty * 100}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>R{calculateTotal()}</span>
                </div>
              </div>
              
              <button
                disabled={calculateTotal() === 0}
                className="w-full mt-4 py-3 px-4 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
