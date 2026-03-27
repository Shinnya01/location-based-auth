<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class LocationAccessUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_enabled' => $this->boolean('is_enabled'),
            'latitude' => $this->input('latitude') === '' ? null : $this->input('latitude'),
            'longitude' => $this->input('longitude') === '' ? null : $this->input('longitude'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'is_enabled' => ['required', 'boolean'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'radius_meters' => ['required', 'integer', 'min:1', 'max:'.config('location-auth.max_radius_meters')],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $hasLatitude = $this->filled('latitude');
                $hasLongitude = $this->filled('longitude');

                if ($hasLatitude xor $hasLongitude) {
                    $validator->errors()->add('latitude', 'Latitude and longitude must be provided together.');
                    $validator->errors()->add('longitude', 'Latitude and longitude must be provided together.');
                }

                if ($this->boolean('is_enabled') && (! $hasLatitude || ! $hasLongitude)) {
                    $validator->errors()->add('latitude', 'Set a valid location before enabling location-based login.');
                    $validator->errors()->add('longitude', 'Set a valid location before enabling location-based login.');
                }
            },
        ];
    }
}
