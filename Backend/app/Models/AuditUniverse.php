<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditUniverse extends Model
{
    protected $fillable = [
        'name', 
        'sub_unit',
        'assessment_type', 
        'category', 
        'risk_register', 
        'corporate_risk_category', 
        'risk',
        'last_audit'
    ];

        public function plans()
    {
        // Sesuaikan dengan nama model jangka panjang Anda
        return $this->hasMany(spijangkapanjang::class, 'audit_universe_id');
        
    }
    
}
